'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';
import { checkConfiguration, normalizeDigits, type SubnetResult } from '@/components/puzzles/ipv4';

const FIELDS = ['ip', 'mask', 'gateway'] as const;
type Field = (typeof FIELDS)[number];

interface SubnetState {
  values: Record<Field, string>;
  result: SubnetResult | null;
}

type SubnetAction = { type: 'set'; field: Field; value: string } | { type: 'connect' };

function reduce(state: SubnetState, action: SubnetAction): SubnetState {
  if (action.type === 'set') {
    return { values: { ...state.values, [action.field]: normalizeDigits(action.value) }, result: null };
  }
  const { ip, mask, gateway } = state.values;
  return { ...state, result: checkConfiguration(ip, mask, gateway) };
}

const definition: PuzzleDefinition<SubnetState, SubnetAction> = {
  // One octet off: the PC sits on 192.168.2.0/24, the router on 192.168.1.0/24.
  initial: () => ({ values: { ip: '192.168.2.50', mask: '255.255.255.0', gateway: '192.168.1.1' }, result: null }),
  reduce,
  isSolved: (state) => state.result?.ok === true,
  script: [
    { kind: 'point', target: 'field-gateway' },
    { kind: 'type', target: 'field-ip', text: '192.168.1.50', action: { type: 'set', field: 'ip', value: '192.168.1.50' } },
    { kind: 'act', target: 'connect', action: { type: 'connect' } },
  ],
};

/**
 * 1995: the modem dialled in, but the PC's TCP/IP settings put it on the wrong
 * subnet. The check is real IPv4 arithmetic (ipv4.ts).
 * Truth: a network needs addresses.
 *
 * Inputs are LTR in every locale; Persian digits typed on a Persian keyboard
 * are converted as they are entered.
 */
export function SubnetPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.win95');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;
  const result = state.result;

  return (
    <PuzzleSurface pointer={engine.pointer} eraIndex={props.eraIndex}>
      <form
        className="bg-surface p-[3px] shadow-window"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: 'connect' });
        }}
      >
        <div className="flex h-6 items-center bg-chrome px-2 font-mono text-xs font-bold text-chrome-ink">
          {t('dialogTitle')}
        </div>
        <div className="flex flex-col gap-3 p-3">
          {FIELDS.map((field, index) => {
            const typed = engine.typingFor(`field-${field}`);
            const id = `win95-${field}`;
            return (
              <div key={field} className="grid grid-cols-1 items-center gap-1 sm:grid-cols-[10rem_1fr] sm:gap-3">
                <label htmlFor={id} className="font-body text-sm text-ink">
                  {t(field)}
                </label>
                <input
                  id={id}
                  {...target(`field-${field}`)}
                  data-autofocus={index === 0 ? '' : undefined}
                  dir="ltr"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  value={typed ?? state.values[field]}
                  readOnly={!interactive}
                  tabIndex={interactive ? undefined : -1}
                  aria-invalid={result !== null && !result.ok && relatesTo(result.key, field)}
                  onChange={(event) => dispatch({ type: 'set', field, value: event.target.value })}
                  className="w-full max-w-[16rem] bg-elevated px-2 py-1 font-mono text-sm text-ink shadow-bevel outline-none focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-ink focus-visible:outline-dotted"
                />
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              {...target('connect')}
              tabIndex={interactive ? undefined : -1}
              className="min-w-24 cursor-pointer bg-surface px-4 py-1 font-body text-sm text-ink shadow-window active:shadow-bevel focus-visible:outline-1 focus-visible:outline-offset-[-4px] focus-visible:outline-ink focus-visible:outline-dotted"
            >
              {t('connect')}
            </button>
          </div>

          <p
            aria-live={interactive ? 'polite' : undefined}
            className={cn('min-h-10 font-body text-sm leading-snug', result?.ok ? 'text-success' : 'text-error')}
          >
            {result && !result.ok ? t(`errors.${result.key}`, result.values) : null}
          </p>
        </div>
      </form>
    </PuzzleSurface>
  );
}

/** Which field an error is about, for aria-invalid. */
function relatesTo(key: string, field: Field): boolean {
  switch (key) {
    case 'invalidMask':
      return field === 'mask';
    case 'gatewayOutside':
    case 'noRouter':
      return field === 'gateway';
    case 'invalidAddress':
      return false;
    default:
      return field === 'ip';
  }
}
