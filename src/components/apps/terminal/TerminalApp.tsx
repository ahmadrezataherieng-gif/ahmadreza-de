'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import { useFocusOnFinePointer, useKeyboardInset, useNativeKeydown } from '@/components/apps/use-app-input';
import {
  HOST,
  PORTFOLIO_COMMANDS,
  USER,
  cancelLine,
  clearScreen,
  complete,
  displayPath,
  initialShell,
  runCommand,
  showCandidates,
  type PortfolioSection,
  type ShellLine,
  type ShellState,
} from '@/components/apps/terminal/shell';
import { closeWindow } from '@/components/os/window-actions';
import { AmonelOsLockup } from '@/components/ui/Brand';
import { skillAreas } from '@/content/about';
import { EMAIL, RESUME } from '@/content/profile';
import { projects } from '@/content/projects';
import { asStringList } from '@/lib/message-shapes';
import { cn } from '@/lib/cn';

/** Machine text: the prompt is the same in every language. */
const PROMPT_USER = `${USER}@${HOST}`;
/** Offered under the welcome line, so a phone visitor need not type to start. */
// CONTENT-TODO CR-509
const STARTERS = ['help', 'about', 'skills', 'projects'] as const;

/**
 * A small real shell in a window. Machine text is English and left-to-right in
 * every locale; what the portfolio commands print is prose in the visitor's
 * language, each paragraph with its own direction.
 */
export function TerminalApp(props: AppProps) {
  return (
    <AppMessages copy={['terminal', 'about']}>
      <Terminal {...props} />
    </AppMessages>
  );
}

function Terminal({ appId }: AppProps) {
  const t = useTranslations('terminal');
  const [shell, setShell] = useState<ShellState>(initialShell);
  const [input, setInput] = useState('');
  /** Position while stepping through history; null when editing a fresh line. */
  const [recall, setRecall] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inset = useKeyboardInset();

  // Newest line in view. The output scrolls itself: scrollIntoView would move
  // the window body and the page along with it.
  useLayoutEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [shell.lines, inset]);

  useFocusOnFinePointer(inputRef);

  useEffect(() => {
    if (!shell.exited) return;
    const root = rootRef.current;
    if (root?.closest('[data-window]')) closeWindow(appId);
    else if (root?.closest('[data-mobile-app]')) window.history.back();
  }, [shell.exited, appId]);

  const run = (line: string) => {
    setShell((state) => runCommand(state, line));
    setInput('');
    setRecall(null);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(input);
  };

  /** The keys a terminal answers; `useNativeKeydown` attaches them to the input itself. */
  const onKeyDown = (event: KeyboardEvent) => {
    const handled = () => {
      event.preventDefault();
      event.stopPropagation();
    };
    const plain = !event.altKey && !event.metaKey && !event.ctrlKey;
    const control = event.ctrlKey && !event.altKey && !event.metaKey;

    if (event.key === 'ArrowUp' && plain && !event.shiftKey) {
      if (shell.history.length === 0) return;
      handled();
      const next = recall === null ? shell.history.length - 1 : Math.max(0, recall - 1);
      setRecall(next);
      setInput(shell.history[next] ?? '');
    } else if (event.key === 'ArrowDown' && plain && !event.shiftKey) {
      if (recall === null) return;
      handled();
      const next = recall + 1;
      if (next >= shell.history.length) {
        setRecall(null);
        setInput('');
      } else {
        setRecall(next);
        setInput(shell.history[next] ?? '');
      }
    } else if (event.key === 'Tab' && plain && !event.shiftKey && input.trim() !== '') {
      // An empty line lets Tab leave the terminal, so keyboard users are never trapped.
      handled();
      const result = complete(shell, input);
      if (result.candidates.length > 0) setShell((state) => showCandidates(state, input, result.candidates));
      setInput(result.input);
    } else if (control && event.key.toLowerCase() === 'l') {
      handled();
      setShell(clearScreen);
    } else if (control && event.key.toLowerCase() === 'c') {
      // With text selected, Ctrl+C copies it, as everywhere else.
      const field = inputRef.current;
      if (field && field.selectionStart !== field.selectionEnd) return;
      handled();
      setShell((state) => cancelLine(state, input));
      setInput('');
      setRecall(null);
    }
  };
  useNativeKeydown(inputRef, onKeyDown);

  /** A click in the output puts the cursor back in the input - unless it selected text to copy. */
  const onOutputClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('a, button')) return;
    if (!window.getSelection()?.isCollapsed) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={rootRef}
      data-app-content={appId}
      dir="ltr"
      className="ao-terminal flex h-full min-h-0 flex-col bg-background font-mono text-[13px] leading-relaxed text-ink"
      style={inset > 0 ? { paddingBottom: inset } : undefined}
    >
      <div
        ref={outputRef}
        role="log"
        aria-live="polite"
        aria-label={t('outputLabel')}
        data-terminal-output=""
        onClick={onOutputClick}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-2 pb-1"
      >
        {shell.lines.map((line) => (
          <Line key={line.id} line={line} onRun={run} />
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex shrink-0 items-center gap-2 border-t border-edge bg-surface px-3 py-2">
        <label htmlFor={`${appId}-input`} className="shrink-0 whitespace-nowrap select-none">
          <Prompt cwd={shell.cwd} />
          <span className="ao-sr-only">{t('inputLabel')}</span>
        </label>
        <input
          ref={inputRef}
          id={`${appId}-input`}
          data-terminal-input=""
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setRecall(null);
          }}
          aria-describedby={`${appId}-hint`}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          className="min-w-0 flex-1 bg-transparent text-ink caret-accent outline-none"
        />
        <span id={`${appId}-hint`} className="ao-sr-only">
          {t('inputHint')}
        </span>
      </form>
    </div>
  );
}

function Prompt({ cwd }: { cwd: string }) {
  return (
    <>
      <span className="text-accent">{PROMPT_USER}</span>
      <span className="text-muted">:</span>
      <span className="text-ink">{displayPath(cwd)}</span>
      <span className="text-muted">$</span>
    </>
  );
}

/** A paragraph of prose inside the machine output: its own direction, so Persian reads right to left. */
function Prose({ children, className }: { children: string; className?: string }) {
  return (
    <p dir="auto" className={cn('font-body text-sm whitespace-pre-wrap', className)}>
      {children}
    </p>
  );
}

function Line({ line, onRun }: { line: ShellLine; onRun: (command: string) => void }) {
  const t = useTranslations('terminal');
  const tOs = useTranslations('os');

  switch (line.kind) {
    case 'input':
      return (
        <p className="break-all whitespace-pre-wrap">
          <Prompt cwd={line.cwd} /> {line.text}
        </p>
      );
    case 'text':
      return (
        <p
          className={cn(
            'break-words whitespace-pre-wrap',
            line.tone === 'error' && 'text-error',
            line.tone === 'muted' && 'text-muted',
          )}
        >
          {line.text || ' '}
        </p>
      );
    case 'list':
      return (
        <p className="flex flex-wrap gap-x-4">
          {line.entries.map((entry) => (
            <span key={entry.name} className={entry.dir ? 'text-accent' : undefined}>
              {entry.dir ? `${entry.name}/` : entry.name}
            </span>
          ))}
        </p>
      );
    case 'message':
      return (
        <div className="my-1 flex flex-col gap-2">
          {line.key === 'motd' ? <AmonelOsLockup label={tOs('brand')} className="self-start text-base" /> : null}
          <Prose className="text-muted">{t(line.key)}</Prose>
          {line.key === 'motd' ? (
            <p className="flex flex-wrap items-center gap-2">
              <span dir="auto" className="font-body text-xs text-muted">
                {t('tryLabel')}
              </span>
              {STARTERS.map((command) => (
                <button
                  key={command}
                  type="button"
                  data-action="terminal-run"
                  data-command={command}
                  onClick={() => onRun(command)}
                  className="ao-themed min-h-8 cursor-pointer rounded-control border border-edge px-2 text-accent hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  {command}
                </button>
              ))}
            </p>
          ) : null}
        </div>
      );
    case 'help':
      return <Help />;
    case 'section':
      return <Section section={line.section} />;
  }
}

const HELP_SHELL = ['ls', 'cd', 'cat', 'pwd', 'whoami', 'echo', 'history', 'uname', 'clear', 'exit'] as const;

function Help() {
  const t = useTranslations('terminal.help');
  const group = (title: string, commands: readonly string[]) => (
    <div className="flex flex-col">
      <Prose className="text-muted">{title}</Prose>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4">
        {commands.map((command) => (
          <div key={command} className="contents">
            <dt className="text-accent">{command}</dt>
            <dd dir="auto" className="font-body text-sm">
              {t(`commands.${command}`)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
  return (
    <div className="my-1 flex flex-col gap-2">
      {group(t('portfolio'), PORTFOLIO_COMMANDS)}
      {group(t('shell'), HELP_SHELL)}
      <Prose className="text-muted">{t('keys')}</Prose>
    </div>
  );
}

const link =
  'text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';

function Section({ section }: { section: PortfolioSection }) {
  const t = useTranslations('terminal');
  const tAbout = useTranslations('about');

  switch (section) {
    case 'about':
      return (
        <div className="my-1 flex flex-col gap-2">
          <p className="text-accent">
            # <bdi>{tAbout('name')}</bdi>
          </p>
          <Prose className="text-muted">{tAbout('role')}</Prose>
          {asStringList(tAbout.raw('intro')).map((paragraph) => (
            <Prose key={paragraph}>{paragraph}</Prose>
          ))}
        </div>
      );
    case 'skills':
      return (
        <div className="my-1 flex flex-col gap-2">
          {skillAreas.map((area) => (
            <div key={area.id}>
              <p className="text-accent">
                [<bdi>{tAbout(`skills.areas.${area.id}.title`)}</bdi>]
              </p>
              <ul>
                {area.skills.map((skill) => (
                  <li key={skill} dir="auto" className="font-body text-sm">
                    <span className="font-mono text-muted" dir="ltr">
                      {'- '}
                    </span>
                    {tAbout(`skills.areas.${area.id}.skills.${skill}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    case 'projects':
      return (
        <div className="my-1 flex flex-col gap-2">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-col gap-1">
              <p className="text-accent">
                # <bdi>{t(`projects.items.${project.id}.name`)}</bdi>
              </p>
              <Prose>{t(`projects.items.${project.id}.text`)}</Prose>
              <p>
                <bdi className="text-muted">{t('projects.site')}</bdi>:{' '}
                <a href={project.url} className={link}>
                  {project.url}
                </a>
              </p>
              <p className="break-all">
                <bdi className="text-muted">{t('projects.source')}</bdi>:{' '}
                <a href={project.source} className={link} rel="noopener" target="_blank">
                  {project.source}
                </a>
              </p>
              <p>
                <bdi className="text-muted">{t('projects.stack')}</bdi>: {project.stack.join(', ')}
              </p>
            </div>
          ))}
          <Prose className="text-muted">{t('projects.more')}</Prose>
        </div>
      );
    case 'cv':
      return RESUME.available ? (
        <div className="my-1 flex flex-col gap-1">
          <Prose>{t('cv.text')}</Prose>
          <p>
            <a href={RESUME.href} download data-action="resume-download" className={link}>
              <bdi>{t('cv.download')}</bdi>
            </a>
          </p>
        </div>
      ) : (
        <Prose className="my-1 text-muted">{t('cv.pending')}</Prose>
      );
    case 'contact':
      return (
        <div className="my-1 flex flex-col gap-1">
          <Prose>{t('contact.text')}</Prose>
          {EMAIL.available ? (
            <p className="wrap-anywhere">
              <a href={`mailto:${EMAIL.address}`} data-action="email" className={link}>
                {EMAIL.address}
              </a>
            </p>
          ) : null}
        </div>
      );
  }
}
