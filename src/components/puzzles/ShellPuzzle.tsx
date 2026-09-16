'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { CrtMonitor } from '@/components/journey/eras/CrtMonitor';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';
import { initialShell, runCommand, type ShellLine, type ShellState } from '@/components/puzzles/shell-filesystem';

type ShellAction = { type: 'run'; text: string };

const run = (text: string): ShellAction => ({ type: 'run', text });

const definition: PuzzleDefinition<ShellState, ShellAction> = {
  initial: initialShell,
  reduce: (state, action) => runCommand(state, action.text),
  isSolved: (state) => state.found,
  script: [
    { kind: 'type', target: 'prompt', text: 'ls', action: run('ls') },
    { kind: 'type', target: 'prompt', text: 'cd home/ahmadreza', action: run('cd home/ahmadreza') },
    { kind: 'type', target: 'prompt', text: 'ls', action: run('ls') },
    { kind: 'type', target: 'prompt', text: 'cd projects', action: run('cd projects') },
    { kind: 'type', target: 'prompt', text: 'ls -a', action: run('ls -a') },
    { kind: 'type', target: 'prompt', text: 'cat .secret', action: run('cat .secret') },
  ],
};

/**
 * 1971: a real prompt inside the CRT. cd, ls, cat and pwd over a small tree;
 * the goal is a dot-file only `ls -a` shows.
 * Truth: a filesystem is a tree, and every file has a path.
 *
 * Machine output is English and LTR in every locale, as the era visuals are.
 */
export function ShellPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.unix');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;

  const [draft, setDraft] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const typed = engine.typingFor('prompt');
  const shown = interactive ? draft : (typed ?? '');

  const history = state.lines.flatMap((line) => (line.kind === 'input' && line.text !== '' ? [line.text] : []));

  // Keep the newest line in view by scrolling the screen itself, never the page.
  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (screen) screen.scrollTop = screen.scrollHeight;
  }, [state.lines.length, shown]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      dispatch(run(draft));
      setDraft('');
      setHistoryIndex(null);
    } else if (event.key === 'ArrowUp' && history.length > 0) {
      event.preventDefault();
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setDraft(history[index] ?? '');
    } else if (event.key === 'ArrowDown' && historyIndex !== null) {
      event.preventDefault();
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(null);
        setDraft('');
      } else {
        setHistoryIndex(index);
        setDraft(history[index] ?? '');
      }
    }
  };

  const renderLine = (line: ShellLine) => {
    switch (line.kind) {
      case 'input':
        return (
          <>
            <span className="text-muted">{line.cwd} $ </span>
            {line.text}
          </>
        );
      case 'text':
        return line.text;
      case 'list':
        return (
          <span className="flex flex-wrap gap-x-4">
            {line.entries.map((entry) => (
              <span key={entry.name} className={cn(entry.dir && 'font-bold text-accent')}>
                {entry.name}
              </span>
            ))}
          </span>
        );
      case 'file':
        return t(`files.${line.content}`);
      case 'help':
        return t('help');
      case 'error':
        return t(`errors.${line.key}`, line.values);
    }
  };

  return (
    <PuzzleSurface pointer={engine.pointer} eraIndex={props.eraIndex}>
      <CrtMonitor label={t('title')} className="rounded-[1.1rem] p-2 sm:p-3">
        <div
          ref={screenRef}
          dir="ltr"
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
          className="h-56 overflow-y-auto px-3 py-2 font-mono text-[15px] leading-snug text-ink sm:h-64 sm:text-base"
        >
          <div role="log" aria-live={interactive ? 'polite' : undefined} className="flex flex-col">
            {state.lines.map((line, index) => (
              <div key={index} className="break-words whitespace-pre-wrap">
                {renderLine(line)}
              </div>
            ))}
          </div>
          <label {...target('prompt')} className="flex items-baseline gap-0">
            <span className="shrink-0 text-muted whitespace-pre">{state.cwd} $ </span>
            <span className="ao-sr-only">{t('inputLabel')}</span>
            <input
              ref={inputRef}
              data-autofocus=""
              value={shown}
              readOnly={!interactive}
              tabIndex={interactive ? undefined : -1}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              className="min-w-0 flex-1 bg-transparent font-mono text-ink caret-accent outline-none"
            />
          </label>
        </div>
      </CrtMonitor>
    </PuzzleSurface>
  );
}
