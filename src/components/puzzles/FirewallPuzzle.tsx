'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';

type RuleAction = 'allow' | 'deny';
// CONTENT-TODO CR-346
const PORT_CHOICES = ['22', '80', '443', '8080'] as const;
type Port = (typeof PORT_CHOICES)[number] | 'any';

interface Rule {
  id: number;
  action: RuleAction;
  protocol: 'tcp' | 'any';
  port: Port;
  /** CIDR, or 'any'. */
  source: string;
  portEditable: boolean;
}

/** The probe every test sends: the service's port, from an address on the internet. */
const PROBE = { protocol: 'tcp', port: '443', source: '203.0.113.7' } as const;

type Outcome = null | { kind: 'blocked'; rule: number } | { kind: 'wideOpen' } | { kind: 'ok' };

interface FirewallState {
  rules: Rule[];
  outcome: Outcome;
}

type FirewallAction =
  | { type: 'toggle'; rule: number }
  | { type: 'port'; rule: number; port: Port }
  | { type: 'test' };

function inCidr(address: string, cidr: string): boolean {
  if (cidr === 'any') return true;
  const [base = '', bits = '32'] = cidr.split('/');
  const toNumber = (text: string) => text.split('.').reduce((sum, octet) => sum * 256 + Number(octet), 0);
  const size = 2 ** (32 - Number(bits));
  return Math.floor(toNumber(address) / size) === Math.floor(toNumber(base) / size);
}

/** First match wins, as in iptables, nftables, cloud security lists and ufw. */
function evaluate(rules: readonly Rule[]): Outcome {
  const match = rules.find(
    (rule) =>
      (rule.protocol === 'any' || rule.protocol === PROBE.protocol) &&
      (rule.port === 'any' || rule.port === PROBE.port) &&
      inCidr(PROBE.source, rule.source),
  );
  if (!match || match.action === 'deny') return { kind: 'blocked', rule: match?.id ?? rules.length };
  // Reachable - but through a catch-all, every other port is open too.
  const catchAllOpen = rules.some((rule) => rule.port === 'any' && rule.source === 'any' && rule.action === 'allow');
  return catchAllOpen || match.port === 'any' ? { kind: 'wideOpen' } : { kind: 'ok' };
}

function reduce(state: FirewallState, action: FirewallAction): FirewallState {
  switch (action.type) {
    case 'toggle':
      return {
        outcome: null,
        rules: state.rules.map((rule) =>
          rule.id === action.rule ? { ...rule, action: rule.action === 'allow' ? 'deny' : 'allow' } : rule,
        ),
      };
    case 'port':
      return {
        outcome: null,
        rules: state.rules.map((rule) =>
          rule.id === action.rule && rule.portEditable ? { ...rule, port: action.port } : rule,
        ),
      };
    case 'test':
      return { ...state, outcome: evaluate(state.rules) };
  }
}

const definition: PuzzleDefinition<FirewallState, FirewallAction> = {
  initial: () => ({
    rules: [
      { id: 1, action: 'allow', protocol: 'tcp', port: '22', source: '10.0.0.0/8', portEditable: false },
      // The fault: a stale DENY that catches HTTPS before any ALLOW is reached.
      { id: 2, action: 'deny', protocol: 'tcp', port: '443', source: 'any', portEditable: true },
      { id: 3, action: 'allow', protocol: 'tcp', port: '80', source: 'any', portEditable: true },
      { id: 4, action: 'deny', protocol: 'any', port: 'any', source: 'any', portEditable: false },
    ],
    outcome: null,
  }),
  reduce,
  isSolved: (state) => state.outcome?.kind === 'ok',
  script: [
    { kind: 'point', target: 'rule-2' },
    { kind: 'act', target: 'action-2', action: { type: 'toggle', rule: 2 } },
    { kind: 'act', target: 'test', action: { type: 'test' } },
  ],
};

/**
 * Today: portfolio-web listens on 443 and nobody can reach it.
 * Truth: programs run isolated, in many places - and a port is the door.
 *
 * Opening everything also makes the test pass, so that answer is caught and
 * named rather than accepted.
 */
export function FirewallPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.cloud');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;
  const outcome = state.outcome;
  const cell = 'px-2 py-1.5 text-start align-middle';
  const keyword = (action: RuleAction) => t(`keywords.${action}`);
  const blockedRule = outcome?.kind === 'blocked' ? outcome.rule : null;

  return (
    <PuzzleSurface pointer={engine.pointer} eraIndex={props.eraIndex} className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-control border border-edge" dir="ltr">
        <table className="w-full min-w-[20rem] border-collapse font-mono text-xs sm:text-sm">
          <thead className="bg-elevated text-muted">
            <tr>
              {(['rule', 'action', 'protocol', 'port', 'source'] as const).map((column) => (
                <th key={column} scope="col" className={cn(cell, 'font-normal')}>
                  {t(`columns.${column}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.rules.map((rule) => (
              <tr
                key={rule.id}
                {...target(`rule-${rule.id}`)}
                className={cn('border-t border-edge', blockedRule === rule.id && 'bg-error/15')}
              >
                <td className={cn(cell, 'text-muted')}>{rule.id}</td>
                <td className={cell}>
                  <button
                    type="button"
                    {...target(`action-${rule.id}`)}
                    tabIndex={interactive ? undefined : -1}
                    aria-label={`${t('actionLabel', { rule: rule.id })}: ${keyword(rule.action)}`}
                    onClick={() => dispatch({ type: 'toggle', rule: rule.id })}
                    className={cn(
                      'min-w-16 cursor-pointer rounded-control border px-2 py-0.5 font-mono text-xs font-bold',
                      rule.action === 'allow' ? 'border-success text-success' : 'border-error text-error',
                    )}
                  >
                    {keyword(rule.action)}
                  </button>
                </td>
                <td className={cn(cell, 'text-ink')}>{rule.protocol === 'any' ? t('any') : t('keywords.tcp')}</td>
                <td className={cn(cell, 'text-ink')}>
                  {rule.portEditable ? (
                    <select
                      {...target(`port-${rule.id}`)}
                      tabIndex={interactive ? undefined : -1}
                      aria-label={t('portLabel', { rule: rule.id })}
                      value={rule.port}
                      onChange={(event) =>
                        dispatch({ type: 'port', rule: rule.id, port: event.target.value as Port })
                      }
                      className="cursor-pointer rounded-control border border-edge bg-background px-1 py-0.5 font-mono text-xs text-ink"
                    >
                      {PORT_CHOICES.map((port) => (
                        <option key={port} value={port}>
                          {port}
                        </option>
                      ))}
                    </select>
                  ) : rule.port === 'any' ? (
                    t('any')
                  ) : (
                    rule.port
                  )}
                </td>
                <td className={cn(cell, 'text-ink')}>{rule.source === 'any' ? t('any') : rule.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          {...target('test')}
          tabIndex={interactive ? undefined : -1}
          onClick={() => dispatch({ type: 'test' })}
          className="cursor-pointer rounded-control border border-accent bg-accent px-3 py-1.5 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted"
        >
          {t('test')}
        </button>
        <span className="font-mono text-xs text-muted">{t('probe')}</span>
      </div>

      <p aria-live={interactive ? 'polite' : undefined} className="min-h-5 font-mono text-sm">
        {outcome?.kind === 'blocked' ? <span className="text-error">{t('blocked', { rule: outcome.rule })}</span> : null}
        {outcome?.kind === 'wideOpen' ? <span className="text-warning">{t('wideOpen')}</span> : null}
      </p>
    </PuzzleSurface>
  );
}
