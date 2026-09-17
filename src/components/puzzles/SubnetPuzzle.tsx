'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';
import { checkConfiguration, normalizeDigits, type SubnetResult } from '@/components/puzzles/ipv4';

const FIELDS = ['ip', 'mask', 'gateway'] as const;
type Field = (typeof FIELDS)[number];

/**
 * Start > Run. Windows 95 showed its IP settings with `winipcfg`; `ipconfig`
 * was the Windows NT tool and did not exist there. The era's insider trick.
 */
type RunResult = null | { kind: 'winipcfg' } | { kind: 'notFound'; name: string };

interface SubnetState {
  values: Record<Field, string>;
  result: SubnetResult | null;
  runOpen: boolean;
  runDraft: string;
  run: RunResult;
  /** winipcfg was run at least once. */
  usedWinipcfg: boolean;
}

type SubnetAction =
  | { type: 'set'; field: Field; value: string }
  | { type: 'connect' }
  | { type: 'openRun' }
  | { type: 'typeRun'; text: string }
  | { type: 'submitRun'; text?: string };

function reduce(state: SubnetState, action: SubnetAction): SubnetState {
  switch (action.type) {
    case 'set':
      return { ...state, values: { ...state.values, [action.field]: normalizeDigits(action.value) }, result: null };
    case 'connect': {
      const { ip, mask, gateway } = state.values;
      return { ...state, result: checkConfiguration(ip, mask, gateway) };
    }
    case 'openRun':
      return { ...state, runOpen: !state.runOpen, run: null };
    case 'typeRun':
      return { ...state, runDraft: action.text };
    case 'submitRun': {
      const name = (action.text ?? state.runDraft).trim();
      if (name === '') return state;
      // Windows matched program names without regard to case or extension.
      const found = name.toLowerCase().replace(/\.exe$/, '') === 'winipcfg';
      return {
        ...state,
        runDraft: '',
        run: found ? { kind: 'winipcfg' } : { kind: 'notFound', name },
        usedWinipcfg: state.usedWinipcfg || found,
      };
    }
  }
}

const definition: PuzzleDefinition<SubnetState, SubnetAction> = {
  // One octet off: the PC sits on 192.168.2.0/24, the router on 192.168.1.0/24.
  initial: () => ({
    values: { ip: '192.168.2.50', mask: '255.255.255.0', gateway: '192.168.1.1' },
    result: null,
    runOpen: false,
    runDraft: '',
    run: null,
    usedWinipcfg: false,
  }),
  reduce,
  isSolved: (state) => state.result?.ok === true,
  usedTrick: (state) => state.usedWinipcfg,
  script: [
    { kind: 'act', target: 'start-run', action: { type: 'openRun' } },
    { kind: 'type', target: 'run-input', text: 'winipcfg', action: { type: 'submitRun', text: 'winipcfg' } },
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

  const runTyped = engine.typingFor('run-input');

  return (
    <PuzzleSurface pointer={engine.pointer} eraIndex={props.eraIndex} className="flex flex-col gap-3">
      <RunBox state={state} dispatch={dispatch} interactive={interactive} typed={runTyped} />
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

/** A corner of the Windows 95 taskbar: Start > Run, and what it can open. */
function RunBox({
  state,
  dispatch,
  interactive,
  typed,
}: {
  state: SubnetState;
  dispatch: (action: SubnetAction) => void;
  interactive: boolean;
  typed: string | null;
}) {
  const t = useTranslations('puzzles.win95');
  const run = state.run;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 bg-surface p-[3px] shadow-window">
        <button
          type="button"
          {...target('start-run')}
          tabIndex={interactive ? undefined : -1}
          aria-expanded={state.runOpen}
          onClick={() => dispatch({ type: 'openRun' })}
          className="cursor-pointer bg-surface px-2 py-0.5 font-body text-sm font-bold text-ink shadow-window active:shadow-bevel"
        >
          {t('runMenu')}
        </button>
        {state.runOpen ? (
          <form
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              dispatch({ type: 'submitRun' });
            }}
          >
            <label htmlFor="win95-run" className="font-body text-sm text-ink">
              {t('runOpen')}
            </label>
            <input
              id="win95-run"
              {...target('run-input')}
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              value={typed ?? state.runDraft}
              readOnly={!interactive}
              tabIndex={interactive ? undefined : -1}
              onChange={(event) => dispatch({ type: 'typeRun', text: event.target.value })}
              className="min-w-0 flex-1 bg-elevated px-2 py-0.5 font-mono text-sm text-ink shadow-bevel outline-none focus-visible:outline-1 focus-visible:outline-dotted focus-visible:outline-ink"
            />
            <button
              type="submit"
              tabIndex={interactive ? undefined : -1}
              className="cursor-pointer bg-surface px-3 py-0.5 font-body text-sm text-ink shadow-window active:shadow-bevel"
            >
              {t('runOk')}
            </button>
          </form>
        ) : null}
      </div>

      <div aria-live={interactive ? 'polite' : undefined}>
        {run?.kind === 'notFound' ? (
          <p className="font-body text-sm text-error">{t('runNotFound', { name: run.name })}</p>
        ) : null}
        {run?.kind === 'winipcfg' ? (
          <div className="bg-surface p-[3px] shadow-window">
            <div className="flex h-6 items-center bg-chrome px-2 font-mono text-xs font-bold text-chrome-ink">
              {t('ipcfgTitle')}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 p-3 font-body text-sm">
              <dt className="text-ink">{t('ipcfgAdapter')}</dt>
              <dd dir="ltr" className="text-start font-mono">44-45-53-54-00-00</dd>
              <dt className="text-ink">{t('ip')}</dt>
              <dd dir="ltr" className="text-start font-mono">{state.values.ip}</dd>
              <dt className="text-ink">{t('mask')}</dt>
              <dd dir="ltr" className="text-start font-mono">{state.values.mask}</dd>
              <dt className="text-ink">{t('gateway')}</dt>
              <dd dir="ltr" className="text-start font-mono">{state.values.gateway}</dd>
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
