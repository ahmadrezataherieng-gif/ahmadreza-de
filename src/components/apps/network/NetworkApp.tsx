'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import { eraSectionHash } from '@/components/apps/unlock';
import { traceHost } from '@/lib/app-handoff';
import {
  checkGateway,
  formatIPv4,
  formatPingLines,
  formatPingSummary,
  formatRecord,
  lookup,
  parseCidr,
  parseIPv4,
  ping,
  pingStats,
  portRange,
  readPortQuery,
  splitSubnet,
  subnetInfo,
  toBinary,
  type DnsLookup,
  type PingTarget,
} from '@/components/apps/network/net';
import { dnsExamples, dnsRecordTypes, dnsZones, pingExamples, portStories, wellKnownPorts, type DnsRecordType } from '@/content/network';
import { eras } from '@/content/eras';
import { routes } from '@/content/routes';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n-config';
import { viewHref } from '@/lib/routing';
import { useReducedMotion } from '@/lib/use-reduced-motion';

type Tab = 'subnet' | 'ping' | 'dns' | 'ports';
const TABS: readonly Tab[] = ['subnet', 'ping', 'dns', 'ports'];

/** One-click examples: machine text, identical in every language. */
// CONTENT-TODO CR-1069
const SUBNET_EXAMPLES = ['192.168.1.10/24', '10.20.30.40/8', '172.16.5.4 255.255.240.0', '192.168.178.23/26', '169.254.12.7/16'] as const;
const DEFAULT_SUBNET = SUBNET_EXAMPLES[0];
const DEFAULT_GATEWAY = '192.168.1.1';
/** Windows 95 waits a second between probes; a little faster reads better here. */
const PING_INTERVAL_MS = 650;

const field =
  'ao-themed min-h-10 w-full min-w-0 rounded-control border border-edge bg-background px-3 font-mono text-sm text-ink placeholder:text-muted focus-visible:border-accent focus-visible:outline-none';
const chip =
  'ao-themed min-h-8 cursor-pointer rounded-control border border-edge px-2.5 font-mono text-xs text-ink hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';
const primary =
  'ao-themed min-h-10 shrink-0 cursor-pointer rounded-control border border-accent bg-accent px-4 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const label = 'font-mono text-xs tracking-wide text-muted uppercase';
const consoleBox = 'ao-themed overflow-x-auto rounded-control border border-edge bg-background p-3 font-mono text-xs leading-relaxed whitespace-pre text-ink';

/**
 * Network tools (Phase 9D-2, DECISIONS.md 63), unlocked by the 1995 puzzle: a
 * network needs addresses. The subnet calculator and the port list are real;
 * ping and DNS are labelled simulations over prepared data - the browser
 * sends nothing anywhere, and nothing is stored.
 */
export function NetworkApp(props: AppProps) {
  return (
    <AppMessages copy={['network']}>
      <NetworkTools {...props} />
    </AppMessages>
  );
}

function NetworkTools({ appId }: AppProps) {
  const t = useTranslations('network');
  const [tab, setTab] = useState<Tab>('subnet');
  const baseId = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ subnet: null, ping: null, dns: null, ports: null });

  const onTabKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.indexOf(tab);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let next: Tab | undefined;
    if (event.key === forward) next = TABS[(index + 1) % TABS.length];
    else if (event.key === back) next = TABS[(index - 1 + TABS.length) % TABS.length];
    else if (event.key === 'Home') next = TABS[0];
    else if (event.key === 'End') next = TABS[TABS.length - 1];
    if (!next) return;
    event.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div data-app-content={appId} className="@container min-h-full">
      <div className="flex flex-col gap-4 p-4 @min-[520px]:p-5">
        <p className="font-body text-sm leading-relaxed text-ink">{t('intro')}</p>

        <div role="tablist" aria-label={t('tabsLabel')} className="flex flex-wrap gap-1 border-b border-edge">
          {TABS.map((id) => (
            <button
              key={id}
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${id}`}
              aria-controls={`${baseId}-panel-${id}`}
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              data-network-tab={id}
              onClick={() => setTab(id)}
              onKeyDown={onTabKey}
              className={cn(
                'ao-themed -mb-px cursor-pointer border-b-2 px-3 py-2 font-mono text-xs tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                tab === id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t(`tabs.${id}`)}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`${baseId}-panel-${tab}`} aria-labelledby={`${baseId}-tab-${tab}`} data-network-panel={tab}>
          {tab === 'subnet' ? <SubnetPanel /> : tab === 'ping' ? <PingPanel /> : tab === 'dns' ? <DnsPanel /> : <PortsPanel />}
        </div>
      </div>
    </div>
  );
}

function SimulationNote({ children }: { children: ReactNode }) {
  return (
    <p className="ao-themed rounded-control border border-dashed border-warning/60 px-3 py-2 font-body text-xs leading-snug text-muted" data-simulation="">
      {children}
    </p>
  );
}

function Examples({ items, onPick, labelText }: { items: readonly string[]; onPick: (value: string) => void; labelText: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={labelText}>
      {items.map((item) => (
        <button key={item} type="button" dir="ltr" className={chip} onClick={() => onPick(item)} data-network-example={item}>
          {item}
        </button>
      ))}
    </div>
  );
}

/* --- subnet ------------------------------------------------------------------- */

function SubnetPanel() {
  const t = useTranslations('network.subnet');
  const id = useId();
  const [input, setInput] = useState<string>(DEFAULT_SUBNET);
  const [gatewayInput, setGatewayInput] = useState(DEFAULT_GATEWAY);
  const [split, setSplit] = useState<number | null>(null);

  const parsed = useMemo(() => parseCidr(input), [input]);
  const info = parsed.ok ? subnetInfo(parsed.address, parsed.prefix) : null;
  const gateway = parseIPv4(gatewayInput);
  const verdict = info && gateway !== null ? checkGateway(info.address, info.prefix, gateway) : null;
  const splitPrefix = info && split !== null && split > info.prefix && split <= 32 ? split : null;
  const blocks = info && splitPrefix !== null ? splitSubnet(info.network, info.prefix, splitPrefix) : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-xs leading-relaxed text-muted">{t('explain')}</p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-cidr`} className={label}>
          {t('inputLabel')}
        </label>
        <input
          id={`${id}-cidr`}
          data-subnet-input=""
          dir="ltr"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setSplit(null);
          }}
          placeholder="192.168.1.10/24"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby={`${id}-cidr-status`}
          className={field}
        />
        <Examples
          items={SUBNET_EXAMPLES}
          labelText={t('examples')}
          onPick={(value) => {
            setInput(value);
            setSplit(null);
          }}
        />
        <p id={`${id}-cidr-status`} aria-live="polite" data-subnet-status={parsed.ok ? 'ok' : parsed.error} className="font-body text-xs text-muted">
          {parsed.ok ? t('summary', { prefix: parsed.prefix, hosts: info?.usable ?? 0 }) : parsed.error === 'empty' ? t('errors.empty') : <span className="text-error">{t(`errors.${parsed.error}`)}</span>}
        </p>
      </div>

      {info ? (
        <>
          <figure className="flex flex-col gap-1.5" data-subnet-bits="">
            <div dir="ltr" role="img" aria-label={t('bitsLabel', { network: info.prefix, host: 32 - info.prefix })} className="flex flex-col gap-1">
              <BitRow value={info.address} prefix={info.prefix} caption={t('bitsAddress')} />
              <BitRow value={info.mask} prefix={info.prefix} caption={t('bitsMask')} />
            </div>
            <figcaption className="flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[1px] bg-accent" />
                {t('legendNetwork', { count: info.prefix })}
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[1px] border border-edge" />
                {t('legendHost', { count: 32 - info.prefix })}
              </span>
            </figcaption>
          </figure>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 @min-[440px]:grid-cols-2" data-subnet-result="">
            <Fact term={t('fields.network')} value={`${formatIPv4(info.network)}/${info.prefix}`} data="network" />
            <Fact term={t('fields.broadcast')} value={info.prefix >= 31 ? '—' : formatIPv4(info.broadcast)} data="broadcast" />
            <Fact term={t('fields.first')} value={formatIPv4(info.firstHost)} data="first" />
            <Fact term={t('fields.last')} value={formatIPv4(info.lastHost)} data="last" />
            <Fact term={t('fields.mask')} value={formatIPv4(info.mask)} data="mask" />
            <Fact term={t('fields.wildcard')} value={formatIPv4(info.wildcard)} data="wildcard" />
            <div className="flex flex-col gap-0.5">
              <dt className="font-mono text-[11px] tracking-wide text-muted uppercase">{t('fields.usable')}</dt>
              <dd className="font-body text-sm text-ink" data-subnet-fact="usable">
                {t('hostCount', { usable: info.usable, total: info.total })}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="font-mono text-[11px] tracking-wide text-muted uppercase">{t('fields.kind')}</dt>
              <dd className="font-body text-sm text-ink" data-subnet-kind={info.kind}>
                {t(`kinds.${info.kind}.name`)}
              </dd>
            </div>
          </dl>
          <p className="font-body text-xs leading-relaxed text-muted" data-subnet-kind-note="">
            {t(`kinds.${info.kind}.note`)}
          </p>
          {info.role !== 'host' ? (
            <p className="ao-themed rounded-control border border-warning/60 px-3 py-2 font-body text-xs text-ink" data-subnet-role={info.role}>
              {t(`roles.${info.role}`)}
            </p>
          ) : null}
          {info.prefix >= 31 ? <p className="font-body text-xs text-muted">{t(info.prefix === 31 ? 'pointToPoint' : 'singleHost')}</p> : null}

          <section aria-labelledby={`${id}-gw`} className="ao-themed flex flex-col gap-2 rounded-control border border-edge bg-surface p-3">
            <h3 id={`${id}-gw`} className="font-display text-sm font-bold text-ink">
              {t('gateway.title')}
            </h3>
            <p className="font-body text-xs leading-relaxed text-muted">{t('gateway.explain')}</p>
            <label htmlFor={`${id}-gw-input`} className={label}>
              {t('gateway.label')}
            </label>
            <input
              id={`${id}-gw-input`}
              data-gateway-input=""
              dir="ltr"
              value={gatewayInput}
              onChange={(event) => setGatewayInput(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className={field}
            />
            <p aria-live="polite" data-gateway-verdict={verdict ?? 'invalid'} className={cn('font-body text-sm', verdict === 'ok' ? 'text-success' : 'text-ink')}>
              <span aria-hidden="true" className="me-1.5 font-mono">
                {verdict === 'ok' ? '✓' : '✗'}
              </span>
              {verdict ? t(`gateway.verdicts.${verdict}`) : t('gateway.invalid')}
            </p>
          </section>

          {info.prefix < 32 ? (
            <section aria-labelledby={`${id}-split`} className="flex flex-col gap-2">
              <h3 id={`${id}-split`} className="font-display text-sm font-bold text-ink">
                {t('split.title')}
              </h3>
              <p className="font-body text-xs leading-relaxed text-muted">{t('split.explain')}</p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('split.label')}>
                {Array.from({ length: Math.min(4, 32 - info.prefix) }, (_, index) => info.prefix + index + 1).map((next) => (
                  <button
                    key={next}
                    type="button"
                    aria-pressed={splitPrefix === next}
                    data-split={next}
                    onClick={() => setSplit(splitPrefix === next ? null : next)}
                    className={cn(chip, splitPrefix === next && 'border-accent bg-accent text-background')}
                  >
                    <bdi dir="ltr">/{next}</bdi> · {t('split.option', { count: 2 ** (next - info.prefix) })}
                  </button>
                ))}
              </div>
              {blocks ? (
                <ol className="flex flex-col gap-1" data-split-result={blocks.count}>
                  {blocks.blocks.map((block) => (
                    <li key={block.network} dir="ltr" className="font-mono text-xs text-ink rtl:text-right">
                      {formatIPv4(block.network)}/{block.prefix}
                      <span className="text-muted">
                        {'  '}
                        {formatIPv4(block.firstHost)} – {formatIPv4(block.lastHost)}
                      </span>
                    </li>
                  ))}
                  {blocks.count > blocks.blocks.length ? <li className="font-body text-xs text-muted">{t('split.more', { count: blocks.count - blocks.blocks.length })}</li> : null}
                </ol>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
      <p className="font-body text-xs leading-relaxed text-muted">{t('truth')}</p>
    </div>
  );
}

function Fact({ term, value, data }: { term: string; value: string; data: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-[11px] tracking-wide text-muted uppercase">{term}</dt>
      <dd dir="ltr" className="font-mono text-sm text-ink rtl:text-right" data-subnet-fact={data}>
        {value}
      </dd>
    </div>
  );
}

/** 32 bits in four octets; the first `prefix` bits belong to the network. */
function BitRow({ value, prefix, caption }: { value: number; prefix: number; caption: string }) {
  const octets = toBinary(value).split('.');
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="w-20 shrink-0 font-mono text-[10.5px] tracking-wide text-muted uppercase">{caption}</span>
      <span className="flex flex-wrap gap-1.5">
        {octets.map((octet, octetIndex) => (
          <span key={octetIndex} className="flex gap-px">
            {[...octet].map((bit, bitIndex) => {
              const position = octetIndex * 8 + bitIndex;
              const network = position < prefix;
              return (
                <span
                  key={bitIndex}
                  className={cn(
                    'flex h-5 w-3.5 items-center justify-center rounded-[2px] border font-mono text-[10px] leading-none',
                    network ? 'border-accent text-accent' : 'border-edge text-muted',
                    network && bit === '1' && 'bg-accent text-background',
                  )}
                >
                  {bit}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </div>
  );
}

/* --- ping --------------------------------------------------------------------- */

function PingPanel() {
  const t = useTranslations('network.ping');
  const id = useId();
  const reduced = useReducedMotion();
  const [input, setInput] = useState('www.newyork.example');
  const [run, setRun] = useState<{ target: PingTarget; key: number } | null>(null);
  const [shown, setShown] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const replies = run?.target.ok ? run.target.replies.length : 0;
  useEffect(() => {
    if (!run?.target.ok) return;
    if (reduced) {
      setShown(replies);
      return;
    }
    if (shown >= replies) return;
    timer.current = window.setTimeout(() => setShown((count) => count + 1), PING_INTERVAL_MS);
    return () => window.clearTimeout(timer.current);
  }, [run, shown, replies, reduced]);

  const start = (value: string) => {
    window.clearTimeout(timer.current);
    setInput(value);
    setShown(0);
    setRun({ target: ping(routes, value), key: Date.now() });
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (input.trim() !== '') start(input);
  };

  const target = run?.target;
  const done = target?.ok ? shown >= target.replies.length : true;
  const lines = target?.ok ? formatPingLines(target) : [];
  const visible = target?.ok ? lines.slice(0, 2 + shown) : [];
  const summary = target?.ok && done ? formatPingSummary(target.ip, pingStats(target.replies)) : [];

  return (
    <div className="flex flex-col gap-4">
      <SimulationNote>{t('simulation')}</SimulationNote>
      <p className="font-body text-xs leading-relaxed text-muted">{t('explain')}</p>
      <form onSubmit={onSubmit} aria-label={t('formLabel')} className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-host`} className={label}>
          {t('targetLabel')}
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-host`}
            data-ping-input=""
            dir="ltr"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="url"
            enterKeyHint="go"
            className={field}
          />
          <button type="submit" className={primary} data-action="ping">
            {t('run')}
          </button>
        </div>
        <Examples items={pingExamples} labelText={t('examples')} onPick={start} />
      </form>

      {target ? (
        <div className="flex flex-col gap-2" aria-live="polite" data-ping-state={!target.ok ? 'unknown' : done ? 'done' : 'running'}>
          <pre dir="ltr" className={consoleBox} data-ping-output="">
            {target.ok ? [...visible, ...(summary.length ? ['', ...summary] : [])].join('\n') : `Unknown host ${target.host}.`}
          </pre>
          {done ? (
            <p className="font-body text-xs leading-relaxed text-ink" data-ping-note={target.ok ? target.kind : 'unknown'}>
              {target.ok ? t(`notes.${target.kind}`, { hops: routeHops(target.host) }) : t('notes.unknown')}
            </p>
          ) : null}
          {target.ok ? (
            <button
              type="button"
              className="w-fit cursor-pointer font-mono text-xs text-accent underline-offset-4 hover:underline"
              onClick={() => traceHost(target.host)}
              data-action="ping-trace"
            >
              {t('trace')}
            </button>
          ) : null}
        </div>
      ) : null}
      <p className="font-body text-xs leading-relaxed text-muted">{t('ttl')}</p>
    </div>
  );
}

function routeHops(host: string): number {
  return routes.find((route) => route.target === host)?.hops.length ?? 1;
}

/* --- DNS ---------------------------------------------------------------------- */

function DnsPanel() {
  const t = useTranslations('network.dns');
  const id = useId();
  const reduced = useReducedMotion();
  const [name, setName] = useState('www.newyork.example');
  const [type, setType] = useState<DnsRecordType>('A');
  const [result, setResult] = useState<DnsLookup | null>(null);
  const [shown, setShown] = useState(0);
  /** name|type -> when it expires, the resolver's cache for as long as this window is open. */
  const cache = useRef(new Map<string, number>());
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const steps = result?.steps.length ?? 0;
  useEffect(() => {
    if (!result) return;
    if (reduced) {
      setShown(steps);
      return;
    }
    if (shown >= steps) return;
    const step = result.steps[shown];
    // Each answer takes its own time, stretched so a person can follow it.
    timer.current = window.setTimeout(() => setShown((count) => count + 1), 250 + (step?.ms ?? 0) * 2);
    return () => window.clearTimeout(timer.current);
  }, [result, shown, steps, reduced]);

  const resolve = (nextName: string, nextType: DnsRecordType) => {
    window.clearTimeout(timer.current);
    const now = Date.now();
    const cached = new Set([...cache.current].filter(([, expires]) => expires > now).map(([key]) => key));
    const answer = lookup(dnsZones, nextName, nextType, cached);
    if (answer.found && !cached.has(`${answer.name}|${answer.type}`)) {
      const ttl = Math.min(...answer.records.map((record) => record.ttl));
      cache.current.set(`${answer.name}|${answer.type}`, now + ttl * 1000);
    }
    setName(nextName);
    setType(nextType);
    setShown(0);
    setResult(answer);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() !== '') resolve(name, type);
  };

  const done = result !== null && shown >= result.steps.length;
  const total = result ? result.steps.reduce((sum, step) => sum + step.ms, 0) : 0;

  return (
    <div className="flex flex-col gap-4">
      <SimulationNote>{t('simulation')}</SimulationNote>
      <p className="font-body text-xs leading-relaxed text-muted">{t('explain')}</p>
      <form onSubmit={onSubmit} aria-label={t('formLabel')} className="flex flex-col gap-2">
        <label htmlFor={`${id}-name`} className={label}>
          {t('nameLabel')}
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-name`}
            data-dns-input=""
            dir="ltr"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="url"
            enterKeyHint="go"
            className={field}
          />
          <button type="submit" className={primary} data-action="dns">
            {t('run')}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('typeLabel')}>
          {dnsRecordTypes.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={type === option}
              data-dns-type={option}
              title={t(`types.${option}`)}
              onClick={() => setType(option)}
              className={cn(chip, type === option && 'border-accent bg-accent text-background')}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('examples')}>
          {dnsExamples.map((example) => (
            <button
              key={`${example.name}|${example.type}`}
              type="button"
              dir="ltr"
              className={chip}
              data-network-example={`${example.name} ${example.type}`}
              onClick={() => resolve(example.name, example.type)}
            >
              {example.name} {example.type}
            </button>
          ))}
        </div>
        <p className="font-body text-xs text-muted">{t(`types.${type}`)}</p>
      </form>

      {result ? (
        <div className="flex flex-col gap-2" aria-live="polite" data-dns-state={done ? (result.found ? 'found' : 'nxdomain') : 'running'}>
          <ol className="flex flex-col gap-1.5" data-dns-steps={result.steps.length}>
            {result.steps.slice(0, shown).map((step, index) => (
              <li key={index} className="ao-themed flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-control border border-edge bg-surface px-3 py-1.5" data-dns-step={step.server}>
                <span className="font-body text-xs font-bold text-ink">{t(`servers.${step.server}`)}</span>
                <bdi dir="ltr" className="font-mono text-[11px] text-muted">
                  {step.zone}
                </bdi>
                <span className="font-body text-xs text-ink">{t(`answers.${step.answer}`)}</span>
                <span dir="ltr" className="ms-auto font-mono text-[11px] text-muted">
                  {step.ms.toFixed(0)} ms
                </span>
              </li>
            ))}
          </ol>
          {done ? (
            <>
              <pre dir="ltr" className={consoleBox} data-dns-output="">
                {result.found
                  ? [`;; ANSWER SECTION:`, ...result.records.map(formatRecord), '', `;; Query time: ${total.toFixed(0)} msec`].join('\n')
                  : [`;; ->>HEADER<<- status: NXDOMAIN`, `;; ${result.name}. IN ${result.type}`, '', `;; Query time: ${total.toFixed(0)} msec`].join('\n')}
              </pre>
              <p className="font-body text-xs leading-relaxed text-ink" data-dns-note="">
                {result.steps[0]?.server === 'cache' ? t('notes.cached') : result.found ? t('notes.found', { ttl: Math.min(...result.records.map((record) => record.ttl)) }) : t('notes.nxdomain')}
                {result.found && result.records.some((record) => record.type === 'CNAME') && type !== 'CNAME' ? ` ${t('notes.cname')}` : ''}
                {result.name === 'amonel.example' && result.type === 'TXT' && result.found ? ` ${t('notes.hello')}` : ''}
              </p>
              {result.found ? (
                <button
                  type="button"
                  className="w-fit cursor-pointer font-mono text-xs text-accent underline-offset-4 hover:underline"
                  onClick={() => traceHost(result.name)}
                  data-action="dns-trace"
                >
                  {t('trace')}
                </button>
              ) : null}
              <button
                type="button"
                className="w-fit cursor-pointer font-mono text-xs text-muted underline-offset-4 hover:text-accent hover:underline"
                onClick={() => {
                  cache.current.clear();
                  setResult(null);
                }}
                data-action="dns-flush"
              >
                {t('flush')}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* --- ports -------------------------------------------------------------------- */

function PortsPanel() {
  const t = useTranslations('network.ports');
  const locale = useLocale() as Locale;
  const id = useId();
  const [input, setInput] = useState('');
  const query = readPortQuery(input);
  const firewallEra = eras[eras.length - 1];

  const rows =
    query.kind === 'number'
      ? wellKnownPorts.filter((entry) => entry.port === query.port)
      : query.kind === 'name'
        ? wellKnownPorts.filter((entry) => entry.service.includes(query.text) || entry.id.toLowerCase().includes(query.text))
        : query.kind === 'empty'
          ? wellKnownPorts
          : [];
  const story = query.kind === 'number' ? portStories.find((entry) => entry.port === query.port) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-xs leading-relaxed text-muted">{t('explain')}</p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-port`} className={label}>
          {t('searchLabel')}
        </label>
        <input
          id={`${id}-port`}
          data-port-input=""
          dir="ltr"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('placeholder')}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className={field}
        />
        <p aria-live="polite" className="font-body text-xs text-muted" data-port-status={query.kind}>
          {query.kind === 'number'
            ? `${t(`ranges.${portRange(query.port)}`)} ${rows.length === 0 && !story ? t('noService') : ''}`
            : query.kind === 'invalid'
              ? t('invalid')
              : query.kind === 'name' && rows.length === 0
                ? t('noMatch')
                : t('count', { count: rows.length })}
        </p>
        {story ? (
          <p className="ao-themed rounded-control border border-warning/60 px-3 py-2 font-body text-xs text-ink" data-port-story={story.id}>
            {t(`stories.${story.id}`)}
          </p>
        ) : null}
      </div>

      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start" data-port-table={rows.length}>
            <caption className="ao-sr-only">{t('caption')}</caption>
            <thead>
              <tr className="border-b border-edge font-mono text-[11px] tracking-wide text-muted uppercase">
                <th scope="col" className="py-1.5 pe-3 text-start font-normal">{t('columns.port')}</th>
                <th scope="col" className="py-1.5 pe-3 text-start font-normal">{t('columns.service')}</th>
                <th scope="col" className="py-1.5 text-start font-normal">{t('columns.use')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.port} className="border-b border-edge/60 align-top" data-port={entry.port}>
                  <td dir="ltr" className="py-1.5 pe-3 font-mono text-xs whitespace-nowrap text-ink rtl:text-right">
                    {entry.port}/{entry.protocols.join('+')}
                  </td>
                  <td dir="ltr" className="py-1.5 pe-3 font-mono text-xs text-accent rtl:text-right">
                    {entry.service}
                  </td>
                  <td className="py-1.5 font-body text-xs text-ink">{t(`services.${entry.id}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="font-body text-xs leading-relaxed text-muted">
        {t('firewall')}{' '}
        <a href={`${viewHref(locale, 'journey')}${eraSectionHash(firewallEra)}`} className="text-accent underline underline-offset-2" data-port-era="">
          {t('firewallLink')}
        </a>
      </p>
    </div>
  );
}

