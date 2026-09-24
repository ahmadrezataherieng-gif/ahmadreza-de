'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import { DEFAULT_OPEN, HOME, displayPath, entries, joinPath, reach, readFile, steps } from '@/components/apps/filesystem/paths';
import type { AppProps } from '@/components/apps/types';
import { cn } from '@/lib/cn';

const ROW =
  'ao-themed flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-control px-2 text-start font-mono text-sm hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';

/**
 * The file tree (APP-07), unlocked by the 1971 puzzle: a filesystem is a tree
 * and every file has a path. It draws the Terminal's own in-memory tree
 * (`readDir` and `readFile` from `terminal/shell.ts`, so the two never
 * differ), lets the visitor click through it, and shows the path of whatever is
 * selected - step by step from the root, in the short form with `~`, and as the
 * Terminal commands that reach it. Nothing is stored and nothing is sent.
 */
export function FilesystemApp(props: AppProps) {
  return (
    <AppMessages copy={['filesystem', 'terminal']}>
      <Explorer {...props} />
    </AppMessages>
  );
}

function Explorer({ appId }: AppProps) {
  const t = useTranslations('filesystem');
  const id = useId();
  const [selected, setSelected] = useState<string>(HOME);
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(DEFAULT_OPEN));
  const [showHidden, setShowHidden] = useState(false);

  const toggle = (path: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  // Clicking a folder selects it and opens or closes it; clicking a file selects it.
  const choose = (path: string, dir: boolean) => {
    setSelected(path);
    if (dir) toggle(path);
  };

  // A step in the path bar goes up to that folder and makes sure the way down is open.
  const goTo = (path: string) => {
    setSelected(path);
    setOpen((current) => new Set([...current, ...steps(path).map((step) => step.path)]));
  };

  return (
    <div data-app-content={appId} className="@container min-h-full">
      <div className="flex flex-col gap-4 p-4 @min-[520px]:p-5">
        <p className="font-body text-sm leading-relaxed text-ink">{t('intro')}</p>

        <div className="grid gap-4 @min-[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section aria-labelledby={`${id}-tree`} className="flex flex-col gap-2">
            <h3 id={`${id}-tree`} className="font-display text-base font-bold text-ink">
              {t('treeLabel')}
            </h3>
            <label className="flex w-fit cursor-pointer items-center gap-2 font-body text-sm text-ink">
              <input type="checkbox" checked={showHidden} onChange={(event) => setShowHidden(event.target.checked)} data-fs-hidden="" className="h-4 w-4 accent-[var(--ao-color-accent)]" />
              {t('showHidden')}
            </label>
            <div dir="ltr" className="ao-themed rounded-control border border-edge bg-background p-2" data-fs-tree="">
              <ul className="flex flex-col">
                <Node path="/" name="/" depth={0} open={open} selected={selected} showHidden={showHidden} onChoose={choose} />
              </ul>
            </div>
            {showHidden ? <p className="font-body text-xs leading-relaxed text-muted">{t('hiddenNote')}</p> : null}
          </section>

          <Detail selected={selected} onGo={goTo} />
        </div>

        <p className="font-body text-sm leading-relaxed text-muted">{t('truth')}</p>
      </div>
    </div>
  );
}

function Node({
  path,
  name,
  depth,
  open,
  selected,
  showHidden,
  onChoose,
}: {
  path: string;
  name: string;
  depth: number;
  open: ReadonlySet<string>;
  selected: string;
  showHidden: boolean;
  onChoose: (path: string, dir: boolean) => void;
}) {
  const t = useTranslations('filesystem');
  const children = entries(path, showHidden);
  const dir = children !== null;
  const expanded = dir && open.has(path);
  const label = name === '/' ? t('root') : name;

  return (
    <li>
      <button
        type="button"
        data-fs-node={path}
        data-fs-kind={dir ? 'dir' : 'file'}
        aria-expanded={dir ? expanded : undefined}
        aria-current={selected === path ? 'true' : undefined}
        aria-label={dir ? t(expanded ? 'close' : 'open', { name: label }) : undefined}
        onClick={() => onChoose(path, dir)}
        style={{ paddingInlineStart: `${0.5 + depth * 1}rem` }}
        className={cn(ROW, selected === path ? 'bg-elevated text-accent' : 'text-ink')}
      >
        <span aria-hidden="true" className="w-4 shrink-0 text-muted">
          {dir ? (expanded ? '▾' : '▸') : '·'}
        </span>
        <span className="min-w-0 wrap-anywhere">{dir && name !== '/' ? `${name}/` : name}</span>
        {path === HOME ? <span className="ms-auto shrink-0 font-body text-[11px] text-muted">{t('home')}</span> : null}
        {path === '/' ? <span className="ms-auto shrink-0 font-body text-[11px] text-muted">{t('root')}</span> : null}
      </button>
      {expanded && children ? (
        <ul>
          {children.map((child) => (
            <Node key={child.name} path={joinPath(path, child.name)} name={child.name} depth={depth + 1} open={open} selected={selected} showHidden={showHidden} onChoose={onChoose} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Detail({ selected, onGo }: { selected: string; onGo: (path: string) => void }) {
  const t = useTranslations('filesystem');
  const tTerminal = useTranslations('terminal');
  const id = useId();
  const way = reach(selected);
  const file = readFile(selected);
  const listing = entries(selected, true);

  return (
    <section aria-labelledby={`${id}-detail`} className="flex min-w-0 flex-col gap-3" data-fs-selected={selected}>
      <h3 id={`${id}-detail`} className="font-display text-base font-bold text-ink">
        {t('detail.title')}
      </h3>

      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-wide text-muted uppercase">{t('detail.path')}</p>
        <code dir="ltr" data-fs-path="" className="ao-themed rounded-control border border-edge bg-background px-3 py-2 font-mono text-sm break-all text-ink">
          {selected}
        </code>
        <p className="font-body text-xs leading-relaxed text-muted">{t('pathExplain')}</p>
      </div>

      <nav aria-label={t('detail.steps')} className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-wide text-muted uppercase">{t('detail.steps')}</p>
        <ol dir="ltr" className="flex flex-wrap items-center gap-1 font-mono text-sm">
          {steps(selected).map((step, index, all) => (
            <li key={step.path} className="flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden="true" className="text-muted">
                  /
                </span>
              ) : null}
              <button
                type="button"
                data-fs-step={step.path}
                aria-current={index === all.length - 1 ? 'true' : undefined}
                onClick={() => onGo(step.path)}
                className={cn(
                  'ao-themed min-h-8 cursor-pointer rounded-control border px-2 hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                  index === all.length - 1 ? 'border-accent text-accent' : 'border-edge text-ink',
                )}
              >
                {step.name === '/' ? t('root') : step.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {way ? (
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 font-body text-sm text-ink">
          <dt className="text-muted">{t('detail.kind')}</dt>
          <dd>{t(way.kind === 'dir' ? 'detail.folder' : 'detail.file')}</dd>
          <dt className="text-muted">{t('detail.short')}</dt>
          <dd dir="ltr" className="font-mono text-start">
            {displayPath(selected)}
          </dd>
        </dl>
      ) : null}

      {way ? (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-wide text-muted uppercase">{t('detail.reach')}</p>
          <pre dir="ltr" data-fs-commands="" className="ao-themed overflow-x-auto rounded-control border border-edge bg-background p-3 font-mono text-xs leading-relaxed text-ink">
            {way.commands.map((command) => `$ ${command}`).join('\n')}
          </pre>
        </div>
      ) : null}

      {file ? (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-wide text-muted uppercase">{t('detail.content')}</p>
          {file.kind === 'text' ? (
            <pre dir="ltr" data-fs-content="text" className="ao-themed overflow-x-auto rounded-control border border-edge bg-background p-3 font-mono text-xs leading-relaxed text-ink">
              {file.lines.join('\n')}
            </pre>
          ) : file.kind === 'message' ? (
            <p data-fs-content="message" dir="auto" className="font-body text-sm leading-relaxed text-ink">
              {tTerminal(file.key)}
            </p>
          ) : (
            <p data-fs-content="section" className="font-body text-sm leading-relaxed text-ink">
              {t.rich('detail.section', { command: () => <code className="font-mono text-accent">{file.section}</code> })}
            </p>
          )}
        </div>
      ) : listing && listing.length === 0 ? (
        <p className="font-body text-sm text-muted" data-fs-empty="">
          {t('detail.empty')}
        </p>
      ) : null}
    </section>
  );
}
