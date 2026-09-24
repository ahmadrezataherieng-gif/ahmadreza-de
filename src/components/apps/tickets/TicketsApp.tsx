'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import {
  PRIORITY_RANK,
  ticketStatuses,
  tickets,
  type MachineBlock,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from '@/content/tickets';
import { asStringList } from '@/lib/message-shapes';
import { cn } from '@/lib/cn';

type Filter = 'all' | TicketStatus;
type Sort = 'priority' | 'number';

/** Room for the list and the ticket side by side, each scrolling on its own. */
const TWO_PANES = { width: 640, height: 320 };

/**
 * A helpdesk in miniature: the list, one ticket at a time, and for each the
 * symptom, the diagnosis step by step with the evidence each step produced,
 * the solution and what it teaches. Filtering by status and sorting are the
 * only interaction - this shows how problems are found, it is not a CRUD app.
 */
export function TicketsApp(props: AppProps) {
  return (
    <AppMessages copy={['tickets']}>
      <Tickets {...props} />
    </AppMessages>
  );
}

function sorted(list: readonly Ticket[], sort: Sort): Ticket[] {
  return [...list].sort((a, b) =>
    sort === 'priority'
      ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.number.localeCompare(b.number)
      : a.number.localeCompare(b.number),
  );
}

/** The window's (or the phone screen's) scrolling body: it scrolls a single pane; two panes scroll inside themselves. */
function windowBody(root: HTMLElement | null): HTMLElement | null {
  return root?.closest<HTMLElement>('[data-window-body]') ?? null;
}

function Tickets({ appId }: AppProps) {
  const t = useTranslations('tickets');
  const rootRef = useRef<HTMLDivElement>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const [wide, setWide] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('priority');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** On a narrow window the ticket replaces the list; this is the one open there. */
  const [openId, setOpenId] = useState<string | null>(null);
  const focusDetail = useRef(false);
  const returnTo = useRef<{ id: string; scroll: number } | null>(null);

  // Laid out against the window, not the viewport: a window can be narrow on a
  // wide screen, and a short one has no room for two scrolling panes.
  useLayoutEffect(() => {
    const frame = windowBody(rootRef.current) ?? rootRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWide(entry.contentRect.width >= TWO_PANES.width && entry.contentRect.height >= TWO_PANES.height);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const visible = sorted(
    tickets.filter((ticket) => filter === 'all' || ticket.status === filter),
    sort,
  );
  const selected = visible.find((ticket) => ticket.id === selectedId) ?? (wide ? visible[0] : undefined);
  const open = wide ? selected : tickets.find((ticket) => ticket.id === openId);

  useEffect(() => {
    if (!focusDetail.current) return;
    focusDetail.current = false;
    detailHeadingRef.current?.focus({ preventScroll: true });
  });

  // Back to the list: where it was scrolled to, with focus on the ticket that was open.
  useLayoutEffect(() => {
    const back = returnTo.current;
    if (openId !== null || back === null) return;
    returnTo.current = null;
    const frame = windowBody(rootRef.current);
    if (frame) frame.scrollTop = back.scroll;
    rootRef.current?.querySelector<HTMLElement>(`[data-ticket="${back.id}"]`)?.focus({ preventScroll: true });
  }, [openId]);

  const choose = (id: string) => {
    setSelectedId(id);
    if (!wide) {
      returnTo.current = { id, scroll: windowBody(rootRef.current)?.scrollTop ?? 0 };
      setOpenId(id);
      focusDetail.current = true;
      const frame = windowBody(rootRef.current);
      if (frame) frame.scrollTop = 0;
    }
  };

  const showList = wide || !open;

  return (
    <div
      ref={rootRef}
      data-app-content={appId}
      data-panes={wide ? '2' : '1'}
      className={cn('flex flex-col', wide ? 'h-full min-h-0' : 'min-h-full')}
    >
      <div className="flex shrink-0 flex-col gap-2 border-b border-edge px-3 py-2.5">
        {/* First, so it is in view however small the window: the way back to the list. */}
        {!showList ? <BackButton onClick={() => setOpenId(null)} /> : null}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="font-display font-bold text-ink">
            {t('heading')} <span className="font-mono text-xs font-normal text-muted">· {t('organisation')}</span>
          </p>
          <p className="font-mono text-xs text-muted" aria-live="polite">
            {t('count', { count: visible.length })}
          </p>
        </div>
        <p className="font-body text-xs leading-snug text-muted">{t('simulation')}</p>
        {showList ? <Controls filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} /> : null}
      </div>

      <div className={cn('grid flex-1', wide && 'min-h-0 grid-cols-[minmax(14rem,2fr)_3fr]')}>
        {showList ? (
          <TicketList tickets={visible} selectedId={wide ? (selected?.id ?? null) : null} onChoose={choose} panes={wide} />
        ) : null}
        {open ? (
          <TicketDetail
            key={open.id}
            ticket={open}
            headingRef={detailHeadingRef}
            scrolls={wide}
          />
        ) : wide ? (
          <p className="p-6 font-body text-sm text-muted">{t('select')}</p>
        ) : null}
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations('tickets');
  return (
    <button
      type="button"
      data-action="ticket-back"
      onClick={onClick}
      className="ao-themed -ms-1 flex min-h-9 w-fit cursor-pointer items-center gap-1.5 rounded-control px-1 font-mono text-xs tracking-wide text-accent uppercase focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M10 3L5 8l5 5" />
      </svg>
      {t('back')}
    </button>
  );
}

function Controls({
  filter,
  onFilter,
  sort,
  onSort,
}: {
  filter: Filter;
  onFilter: (filter: Filter) => void;
  sort: Sort;
  onSort: (sort: Sort) => void;
}) {
  const t = useTranslations('tickets');
  const sortId = useId();
  const filters: Filter[] = ['all', ...ticketStatuses];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div role="group" aria-label={t('filterLabel')} className="flex flex-wrap gap-1">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            data-filter={value}
            aria-pressed={filter === value}
            onClick={() => onFilter(value)}
            className={cn(
              'ao-themed min-h-8 cursor-pointer rounded-control border px-2.5 font-mono text-xs focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
              filter === value ? 'border-accent bg-accent text-background' : 'border-edge text-muted hover:border-accent hover:text-ink',
            )}
          >
            {value === 'all' ? t('all') : t(`status.${value}`)}
          </button>
        ))}
      </div>
      <label htmlFor={sortId} className="flex items-center gap-1.5 font-mono text-xs text-muted">
        {t('sortLabel')}
        <select
          id={sortId}
          data-sort=""
          value={sort}
          onChange={(event) => onSort(event.target.value === 'number' ? 'number' : 'priority')}
          className="ao-themed min-h-8 cursor-pointer rounded-control border border-edge bg-surface px-1.5 text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <option value="priority">{t('sort.priority')}</option>
          <option value="number">{t('sort.number')}</option>
        </select>
      </label>
    </div>
  );
}

const STATUS_TONE: Record<TicketStatus, string> = {
  inProgress: 'border-accent/60 text-accent',
  waiting: 'border-warning/60 text-warning',
  resolved: 'border-success/60 text-success',
};

const PRIORITY_TONE: Record<TicketPriority, string> = {
  high: 'bg-error',
  normal: 'bg-accent',
  low: 'bg-muted',
};

function StatusBadge({ status }: { status: TicketStatus }) {
  const t = useTranslations('tickets.status');
  return (
    <span data-status={status} className={cn('rounded-control border px-1.5 font-mono text-[11px] whitespace-nowrap', STATUS_TONE[status])}>
      {t(status)}
    </span>
  );
}

function PriorityMark({ priority }: { priority: TicketPriority }) {
  const t = useTranslations('tickets');
  const label = t('priorityLabel', { priority: t(`priority.${priority}`) });
  return (
    <span className="flex items-center gap-1 font-mono text-[11px] text-muted" title={label}>
      <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', PRIORITY_TONE[priority])} />
      <span className="ao-sr-only">{label}</span>
      <span aria-hidden="true">{t(`priority.${priority}`)}</span>
    </span>
  );
}

function TicketList({
  tickets: list,
  selectedId,
  onChoose,
  panes,
}: {
  tickets: readonly Ticket[];
  selectedId: string | null;
  onChoose: (id: string) => void;
  /** Beside the ticket: bordered, and scrolling on its own. */
  panes: boolean;
}) {
  const t = useTranslations('tickets');
  if (list.length === 0) return <p className="p-4 font-body text-sm text-muted">{t('empty')}</p>;

  return (
    <ul aria-label={t('listLabel')} data-ticket-list="" className={cn(panes && 'min-h-0 overflow-y-auto border-e border-edge')}>
      {list.map((ticket) => (
        <li key={ticket.id} className="border-b border-edge/60">
          <button
            type="button"
            data-ticket={ticket.id}
            aria-current={selectedId === ticket.id ? 'true' : undefined}
            onClick={() => onChoose(ticket.id)}
            className={cn(
              'ao-themed flex w-full cursor-pointer flex-col gap-1 px-3 py-2.5 text-start hover:bg-elevated focus-visible:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
              selectedId === ticket.id && 'bg-elevated shadow-[inset_3px_0_0_var(--ao-color-accent)] rtl:shadow-[inset_-3px_0_0_var(--ao-color-accent)]',
            )}
          >
            <span className="flex flex-wrap items-center gap-2">
              <bdi className="font-mono text-xs text-muted">{ticket.number}</bdi>
              <StatusBadge status={ticket.status} />
              <PriorityMark priority={ticket.priority} />
            </span>
            <span className="font-body text-sm font-bold text-ink">{t(`tickets.${ticket.id}.title`)}</span>
            <span className="font-body text-xs text-muted">{t(`category.${ticket.category}`)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function DetailSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      <h4 className="font-mono text-xs tracking-wide text-accent uppercase">{title}</h4>
      {children}
    </section>
  );
}

/** The evidence a step produced, as the console showed it. Machine text: always LTR. */
function Console({ block }: { block: MachineBlock }) {
  const t = useTranslations('tickets');
  return (
    <pre
      dir="ltr"
      data-console=""
      className="ao-themed overflow-x-auto rounded-control border border-edge bg-background p-2.5 font-mono text-[11.5px] leading-relaxed text-ink"
    >
      <span className="text-accent">{block.command}</span>
      {'\n'}
      {block.output.length > 0 ? block.output.join('\n') : <span className="text-muted">{t('noOutput')}</span>}
    </pre>
  );
}

function TicketDetail({
  ticket,
  headingRef,
  scrolls,
}: {
  ticket: Ticket;
  headingRef: RefObject<HTMLHeadingElement | null>;
  scrolls: boolean;
}) {
  const t = useTranslations('tickets');
  const format = useFormatter();
  const steps = asStringList(t.raw(`tickets.${ticket.id}.steps`));
  const base = `tickets.${ticket.id}`;

  return (
    <article
      data-ticket-detail={ticket.id}
      aria-labelledby={`ticket-${ticket.id}`}
      // A pane that scrolls on its own must be reachable by keyboard to scroll it (WCAG 2.1.1).
      tabIndex={scrolls ? 0 : undefined}
      className={cn(scrolls && 'min-h-0 overflow-y-auto focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none')}
    >
      <div className="flex flex-col gap-5 p-4">
        <header className="flex flex-col gap-1.5">
          <p className="flex flex-wrap items-center gap-2">
            <bdi className="font-mono text-xs text-muted">{ticket.number}</bdi>
            <StatusBadge status={ticket.status} />
            <PriorityMark priority={ticket.priority} />
            <span className="font-body text-xs text-muted">{t(`category.${ticket.category}`)}</span>
          </p>
          <h3
            id={`ticket-${ticket.id}`}
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-lg leading-snug font-bold text-ink outline-none"
          >
            {t(`${base}.title`)}
          </h3>
          <p className="font-body text-xs text-muted">{t(`${base}.reporter`)}</p>
        </header>

        <DetailSection title={t('sections.reported')}>
          <p className="font-body text-sm leading-relaxed text-ink">{t(`${base}.symptom`)}</p>
        </DetailSection>

        <DetailSection title={t('sections.diagnosis')}>
          <ol className="flex flex-col gap-4">
            {ticket.steps.map((block, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-edge font-mono text-[11px] text-muted"
                >
                  {format.number(index + 1)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="ao-sr-only">{t('stepLabel', { step: index + 1 })}</span>
                  <p className="font-body text-sm leading-relaxed text-ink">{steps[index]}</p>
                  {block ? <Console block={block} /> : null}
                </div>
              </li>
            ))}
          </ol>
        </DetailSection>

        <DetailSection title={ticket.status === 'resolved' ? t('sections.solution') : t('sections.plannedSolution')}>
          <p className="font-body text-sm leading-relaxed text-ink">{t(`${base}.solution`)}</p>
        </DetailSection>

        <DetailSection
          title={t('sections.lesson')}
          className="ao-themed rounded-control border border-accent/40 bg-elevated/60 p-3"
        >
          <p data-lesson="" className="font-body text-sm leading-relaxed text-ink">
            {t(`${base}.lesson`)}
          </p>
        </DetailSection>
      </div>
    </article>
  );
}
