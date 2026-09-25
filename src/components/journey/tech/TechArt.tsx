import type { CSSProperties, ReactNode } from 'react';

import type { TechId } from '@/content/crossings';

/**
 * One generic drawing per technology between two eras (BR-10).
 *
 * Every drawing is inline SVG on a 160 x 120 grid, drawn from a few shapes:
 * no logo, no trademark, nothing raster. Colours come only from the classes in
 * globals.css (`tt-*`), which read the shot's own era tokens. Motion is a
 * function of `--t`, the shot's own progress (0..1, written per shot in CSS);
 * it is written as `transform` and `opacity` only, and every drawing is tidy and
 * complete at t = 0.5, which is what reduced motion shows.
 *
 * Per-element numbers (`--dx`, `--a`, `--ph` ...) are geometry and timing, not
 * theme values, so they are inline custom properties.
 */

/** Custom properties on one element. */
const v = (values: Record<string, string | number>) => values as CSSProperties;

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 120" className="tt-svg" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/** A lamp that flickers on its own phase. */
function Lamp({ x, y, ph, r = 2.6 }: { x: number; y: number; ph: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} className="tt-acc tt-blink" style={v({ '--ph': `${ph}deg` })} />;
}

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

const AI_LAYERS = [
  { x: 30, ys: [30, 60, 90] },
  { x: 80, ys: [22, 46, 70, 94] },
  { x: 130, ys: [42, 78] },
] as const;

const ART: Record<TechId, () => ReactNode> = {
  /* 1947: a vacuum tube shrinks into a transistor. */
  transistor: () => (
    <Svg>
      <g className="tt-m tt-tube-out">
        <path d="M62 92V46a18 18 0 0 1 36 0v46z" className="tt-body" />
        <rect x="58" y="92" width="44" height="10" rx="2" className="tt-body" />
        <path d="M70 92V64M90 92V64M70 64l5-9 5 9 5-9 5 9" className="tt-accl" />
        <path d="M70 102v8M80 102v8M90 102v8" className="tt-ln" />
      </g>
      <g className="tt-m tt-trans-in">
        <circle cx="80" cy="52" r="21" className="tt-body" />
        <path d="M100 44l4-2v20l-4-2" className="tt-dim" />
        <circle cx="80" cy="52" r="12" className="tt-dim" />
        <path d="M68 70v34M80 73v31M92 70v34" className="tt-ln" />
        <circle cx="72" cy="45" r="3" className="tt-acc" />
      </g>
    </Svg>
  ),

  /* 1951: a console between two tape cabinets, reels turning. */
  univac: () => (
    <Svg>
      <rect x="10" y="26" width="34" height="76" rx="2" className="tt-body" />
      <rect x="116" y="26" width="34" height="76" rx="2" className="tt-body" />
      {[46, 80].map((y) => (
        <g key={y}>
          <circle cx="27" cy={y} r="9" className="tt-dim" />
          <circle cx="27" cy={y} r="3" className="tt-mute tt-m tt-spin" style={v({ '--turn': '420deg' })} />
          <circle cx="133" cy={y} r="9" className="tt-dim" />
          <circle cx="133" cy={y} r="3" className="tt-mute tt-m tt-spin" style={v({ '--turn': '-420deg' })} />
        </g>
      ))}
      <rect x="50" y="48" width="60" height="54" rx="2" className="tt-body" />
      <path d="M50 66H110" className="tt-dim" />
      {range(6).map((i) => (
        <Lamp key={i} x={60 + i * 8} y={57} ph={i * 60} r={2.2} />
      ))}
      {range(6).map((i) => (
        <Lamp key={i} x={60 + i * 8} y={76} ph={i * 60 + 180} r={2.2} />
      ))}
      <path d="M60 90H100" className="tt-dim" />
    </Svg>
  ),

  /* 1953: a plane of tiny rings on a lattice of wires. */
  coreMemory: () => (
    <Svg>
      <rect x="24" y="14" width="112" height="92" rx="3" className="tt-body" />
      {range(4).map((i) => (
        <g key={i}>
          <path d={`M36 ${30 + i * 20}H124`} className="tt-dim" />
          <path d={`M${44 + i * 24} 24V96`} className="tt-dim" />
        </g>
      ))}
      {range(16).map((i) => {
        const x = 44 + (i % 4) * 24;
        const y = 30 + Math.floor(i / 4) * 20;
        const set = [0, 5, 6, 10, 15].includes(i);
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="8"
            ry="4"
            transform={`rotate(-45 ${x} ${y})`}
            className={set ? 'tt-accl tt-blink' : 'tt-ln'}
            style={set ? v({ '--ph': `${i * 40}deg`, '--rate': '360deg' }) : undefined}
          />
        );
      })}
    </Svg>
  ),

  /* 1958: many transistors gather into one chip. */
  integratedCircuit: () => (
    <Svg>
      {range(9).map((i) => {
        const gx = (i % 3) - 1;
        const gy = Math.floor(i / 3) - 1;
        return (
          <g
            key={i}
            className="tt-m tt-gather"
            style={v({ '--dx': `${gx * 46}px`, '--dy': `${gy * 34}px` })}
          >
            <circle cx={80 + gx * 6} cy={60 + gy * 6} r="5" className="tt-body" />
          </g>
        );
      })}
      <g className="tt-m tt-chip-in">
        <rect x="46" y="26" width="68" height="68" rx="3" className="tt-body" />
        <rect x="60" y="40" width="40" height="40" rx="2" className="tt-dim" />
        <path d="M66 50h14v10h14M66 70h10v-6h18M80 40v-6" className="tt-accl" />
        <path
          d="M56 26v-8M68 26v-8M80 26v-8M92 26v-8M104 26v-8M56 94v8M68 94v8M80 94v8M92 94v8M104 94v8M46 38h-8M46 50h-8M46 62h-8M46 74h-8M114 38h8M114 50h8M114 62h8M114 74h8"
          className="tt-ln"
        />
      </g>
    </Svg>
  ),

  /* 1964: a family of cabinets, all speaking to one another. */
  system360: () => (
    <Svg>
      {[
        [8, 60, 42],
        [44, 76, 38],
        [80, 60, 42],
        [116, 44, 36],
      ].map(([x, h, w], i) => (
        <g key={x}>
          <rect x={x} y={104 - h} width={w} height={h} rx="2" className="tt-body" />
          <path d={`M${x + 4} ${112 - h}H${x + w - 4}`} className="tt-dim" />
          {i % 2 === 0 ? (
            <circle cx={x + w / 2} cy={104 - h / 2 + 4} r="9" className="tt-dim" />
          ) : (
            <path d={`M${x + 6} ${104 - h / 2 + 4}H${x + w - 6}M${x + 6} ${104 - h / 2 + 12}H${x + w - 6}`} className="tt-dim" />
          )}
          <Lamp x={x + 8} y={104 - h + 14} ph={i * 90} r={2} />
          <Lamp x={x + 16} y={104 - h + 14} ph={i * 90 + 200} r={2} />
        </g>
      ))}
      <path d="M2 106H158" className="tt-ln" />
    </Svg>
  ),

  /* 1969: four machines, a packet crossing between them. */
  arpanet: () => (
    <Svg>
      <path d="M32 84L58 32L112 44L130 92zM58 32L130 92M32 84L112 44" className="tt-dim" />
      {[
        [32, 84],
        [58, 32],
        [112, 44],
        [130, 92],
      ].map(([x, y]) => (
        <g key={x}>
          <rect x={x - 11} y={y - 8} width="22" height="16" rx="2" className="tt-body" />
          <path d={`M${x - 6} ${y - 3}H${x + 6}M${x - 6} ${y + 2}H${x + 2}`} className="tt-dim" />
        </g>
      ))}
      <circle cx="32" cy="84" r="3.4" className="tt-acc tt-m tt-slide" style={v({ '--dx': '26px', '--dy': '-52px', '--a': 0.1, '--b': 0.4 })} />
      <circle cx="58" cy="32" r="3.4" className="tt-acc tt-m tt-slide" style={v({ '--dx': '54px', '--dy': '12px', '--a': 0.4, '--b': 0.4 })} />
      <circle cx="112" cy="44" r="3.4" className="tt-acc tt-m tt-slide" style={v({ '--dx': '18px', '--dy': '48px', '--a': 0.6, '--b': 0.35 })} />
    </Svg>
  ),

  /* 1971: a ceramic chip with a window onto its die. */
  intel4004: () => (
    <Svg>
      <rect x="34" y="36" width="92" height="48" rx="2" className="tt-body" />
      <path d="M34 54a6 6 0 0 1 0 12" className="tt-dim" />
      <rect x="58" y="46" width="44" height="28" rx="2" className="tt-dim" />
      <rect x="64" y="52" width="32" height="16" className="tt-acc tt-blink" style={v({ '--rate': '360deg' })} />
      <path d="M72 52v16M80 52v16M88 52v16" className="tt-ln" />
      {range(8).map((i) => (
        <path key={i} d={`M${44 + i * 10} 36v-9M${44 + i * 10} 84v9`} className="tt-ln" />
      ))}
    </Svg>
  ),

  /* 1971: an eight-inch floppy in its sleeve, the disc turning inside. */
  floppy: () => (
    <Svg>
      <rect x="34" y="10" width="92" height="100" rx="4" className="tt-body" />
      <circle cx="80" cy="56" r="27" className="tt-dim" />
      <circle cx="80" cy="56" r="20" className="tt-fill tt-ln" />
      <g className="tt-m tt-spin" style={v({ '--turn': '360deg' })}>
        <circle cx="80" cy="56" r="8" className="tt-mute" />
        <path d="M80 56V40" className="tt-ln" />
      </g>
      <rect x="74" y="10" width="12" height="20" rx="2" className="tt-dim" />
      <rect x="44" y="88" width="72" height="14" rx="2" className="tt-dim" />
      <path d="M50 95H84" className="tt-dim" />
      <path d="M126 24h-6v14h6" className="tt-dim" />
    </Svg>
  ),

  /* 1973: machines on one shared cable, packets running along it. */
  ethernet: () => (
    <Svg>
      <path d="M6 66H154M6 72H154" className="tt-ln" />
      {[30, 80, 130].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 66${i === 1 ? 'V96' : 'V46'}`} className="tt-ln" />
          <rect x={x - 14} y={i === 1 ? 96 : 26} width="28" height="20" rx="2" className="tt-body" />
          <path d={`M${x - 8} ${i === 1 ? 102 : 32}H${x + 8}`} className="tt-dim" />
        </g>
      ))}
      <circle cx="30" cy="69" r="3.6" className="tt-acc tt-m tt-slide" style={v({ '--dx': '84px', '--a': 0.1, '--b': 0.5 })} />
      <circle cx="130" cy="69" r="3.6" className="tt-acc tt-m tt-slide" style={v({ '--dx': '-84px', '--a': 0.4, '--b': 0.5 })} />
    </Svg>
  ),

  /* 1975: a front panel of lamps and toggle switches, and nothing else. */
  altair: () => (
    <Svg>
      <rect x="10" y="30" width="140" height="62" rx="3" className="tt-body" />
      <path d="M10 46H150" className="tt-dim" />
      {range(8).map((i) => (
        <Lamp key={i} x={28 + i * 15} y={38} ph={i * 47} r={2.6} />
      ))}
      {range(8).map((i) => (
        <g key={i}>
          <rect x={23 + i * 15} y={64} width="10" height="16" rx="2" className="tt-dim" />
          <path
            d={`M${28 + i * 15} 72V${i % 3 === 0 ? 62 : 84}`}
            className="tt-ln"
            style={{ strokeWidth: 3.6 }}
          />
        </g>
      ))}
      <rect x="20" y="52" width="120" height="4" className="tt-fill" />
    </Svg>
  ),

  /* 1977: a screen on a keyboard case. */
  appleII: () => (
    <Svg>
      <rect x="42" y="10" width="76" height="54" rx="4" className="tt-body" />
      <rect x="49" y="17" width="62" height="38" rx="2" className="tt-fill tt-dim" />
      <path d="M55 26h34M55 34h44M55 42h22" className="tt-accl" />
      <rect x="80" y="40" width="6" height="5" className="tt-acc tt-blink" style={v({ '--rate': '720deg' })} />
      <path d="M22 106l10-38h96l10 38z" className="tt-body" />
      <path d="M40 78H120M37 88H123M34 98H126" className="tt-dim" strokeDasharray="6 3" style={{ strokeWidth: 5 }} />
    </Svg>
  ),

  /* 1968: a wooden block with one button; the pointer follows it. */
  mouse: () => (
    <Svg>
      <rect x="8" y="10" width="52" height="38" rx="3" className="tt-body" />
      <path d="M14 14v24l6-6 4 10 5-2-4-10h9z" className="tt-acc tt-m tt-slide" style={v({ '--dx': '20px', '--dy': '6px', '--a': 0.1, '--b': 0.5 })} />
      <g className="tt-m tt-slide" style={v({ '--dx': '10px', '--dy': '-4px', '--a': 0.1, '--b': 0.5 })}>
        <path d="M100 52C110 30 124 18 150 10" className="tt-dim" />
        <rect x="80" y="52" width="40" height="56" rx="11" className="tt-wood" />
        <path d="M86 66H114M86 76H114M86 86H114" className="tt-dim" style={{ opacity: 0.5 }} />
        <rect x="90" y="56" width="20" height="14" rx="3" className="tt-acc" />
      </g>
    </Svg>
  ),

  /* 1973: overlapping windows on a portrait screen. */
  alto: () => (
    <Svg>
      <rect x="42" y="6" width="76" height="90" rx="4" className="tt-body" />
      <rect x="48" y="12" width="64" height="78" className="tt-fill tt-dim" />
      <rect x="52" y="17" width="40" height="30" className="tt-body" />
      <path d="M52 24H92" className="tt-dim" />
      <g className="tt-m tt-in" style={v({ '--a': 0.1, '--b': 0.3 })}>
        <rect x="66" y="40" width="42" height="34" className="tt-body" />
        <path d="M66 47H108M72 56h24M72 64h16" className="tt-dim" />
      </g>
      <rect x="53" y="76" width="9" height="9" className="tt-mute" />
      <path d="M96 60l0 14 4-4 3 7 3-1-3-7 5 0z" className="tt-acc tt-m tt-slide" style={v({ '--dx': '-14px', '--dy': '-8px', '--a': 0.15, '--b': 0.4 })} />
      <rect x="34" y="102" width="92" height="12" rx="2" className="tt-body" />
      <path d="M40 108H120" className="tt-dim" strokeDasharray="6 3" style={{ strokeWidth: 4 }} />
      <rect x="132" y="98" width="12" height="16" rx="5" className="tt-body" />
    </Svg>
  ),

  /* 1983: a tall case with a screen above two disk slots. */
  lisa: () => (
    <Svg>
      <rect x="40" y="6" width="80" height="88" rx="4" className="tt-body" />
      <rect x="48" y="14" width="64" height="42" rx="2" className="tt-fill tt-dim" />
      <rect x="53" y="19" width="26" height="16" className="tt-body" />
      <path d="M53 24H79" className="tt-dim" />
      <path d="M86 22h20M86 30h14M86 38h20" className="tt-accl" />
      <rect x="52" y="66" width="26" height="5" rx="1" className="tt-ln" />
      <rect x="82" y="66" width="26" height="5" rx="1" className="tt-ln" />
      <path d="M52 80H108M52 86H108" className="tt-dim" />
      <rect x="30" y="100" width="100" height="14" rx="2" className="tt-body" />
      <path d="M38 107H122" className="tt-dim" strokeDasharray="6 3" style={{ strokeWidth: 5 }} />
    </Svg>
  ),

  /* 1985: a disc, its sheen turning. */
  cdrom: () => (
    <Svg>
      <circle cx="80" cy="60" r="46" className="tt-body" />
      {[38, 30, 22].map((r) => (
        <circle key={r} cx="80" cy="60" r={r} className="tt-dim" />
      ))}
      <g className="tt-m tt-spin" style={v({ '--turn': '260deg' })}>
        <path d="M80 60V14A46 46 0 0 1 118 34z" className="tt-sheen" />
        <path d="M80 60V106A46 46 0 0 1 42 86z" className="tt-sheen" />
      </g>
      <circle cx="80" cy="60" r="13" className="tt-fill tt-ln" />
      <circle cx="80" cy="60" r="4" className="tt-ln" />
    </Svg>
  ),

  /* 1991: a globe and the links between its places. */
  web: () => (
    <Svg>
      <circle cx="80" cy="60" r="40" className="tt-body" />
      <ellipse cx="80" cy="60" rx="17" ry="40" className="tt-dim" />
      <ellipse cx="80" cy="60" rx="32" ry="40" className="tt-dim" />
      <path d="M40 60H120M46 38H114M46 82H114" className="tt-dim" />
      <path d="M52 40L104 50L88 92L46 78zM104 50L128 24" className="tt-accl" />
      {[
        [52, 40],
        [104, 50],
        [88, 92],
        [46, 78],
        [128, 24],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" className="tt-acc tt-blink" style={v({ '--ph': `${i * 70}deg`, '--rate': '360deg' })} />
      ))}
    </Svg>
  ),

  /* 1991: a terminal, a prompt and a cursor. */
  linux: () => (
    <Svg>
      <rect x="18" y="16" width="124" height="88" rx="4" className="tt-body" />
      <path d="M18 32H142" className="tt-dim" />
      {[28, 38, 48].map((x) => (
        <circle key={x} cx={x} cy="24" r="2.4" className="tt-mute" />
      ))}
      <path d="M28 46l7 5-7 5" className="tt-accl" />
      <path d="M42 51H88" className="tt-ln" />
      <path d="M28 68h58M28 78h78M28 88h34" className="tt-dim" />
      <rect x="68" y="84" width="8" height="10" className="tt-acc tt-blink" style={v({ '--rate': '720deg' })} />
    </Svg>
  ),

  /* Dial-up: a box of lamps on a telephone cord, its tone as rings. */
  modem: () => (
    <Svg>
      <rect x="22" y="66" width="116" height="34" rx="4" className="tt-body" />
      <path d="M32 74H128" className="tt-dim" />
      {range(4).map((i) => (
        <Lamp key={i} x={40 + i * 14} y={88} ph={i * 100} r={2.6} />
      ))}
      <rect x="104" y="82" width="22" height="9" rx="2" className="tt-dim" />
      <path d="M22 84H6c-4 0-4-10-4-24" className="tt-ln" />
      {[10, 20, 30].map((r, i) => (
        <path
          key={r}
          d={`M${80 - r} ${52 - r * 0.2}a${r} ${r} 0 0 1 ${r * 2} 0`}
          className="tt-accl tt-blink"
          style={v({ '--ph': `${i * 120}deg`, '--rate': '540deg' })}
        />
      ))}
    </Svg>
  ),

  /* 1998: a lens over a page of results. */
  search: () => (
    <Svg>
      <rect x="14" y="12" width="104" height="96" rx="4" className="tt-body" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="26" y={26 + i * 20} width={i === 1 ? 44 : 60} height="5" rx="2" className={i === 1 ? 'tt-acc' : 'tt-mute'} />
          <path d={`M26 ${36 + i * 20}H${88 - (i % 2) * 14}`} className="tt-dim" />
        </g>
      ))}
      <g className="tt-m tt-slide" style={v({ '--dx': '-6px', '--dy': '-8px', '--a': 0.1, '--b': 0.5 })}>
        <circle cx="96" cy="66" r="24" className="tt-lens" />
        <path d="M114 84l22 22" className="tt-ln" style={{ strokeWidth: 7 }} />
      </g>
    </Svg>
  ),

  /* 1999: a router and the rings it sends. */
  wifi: () => (
    <Svg>
      <rect x="46" y="88" width="68" height="18" rx="3" className="tt-body" />
      <path d="M58 88L52 68M102 88L108 68" className="tt-ln" />
      <circle cx="80" cy="97" r="2.6" className="tt-acc" />
      <circle cx="94" cy="97" r="2.6" className="tt-acc tt-blink" />
      {[16, 32, 48].map((r, i) => (
        <path
          key={r}
          d={`M${80 - r * 0.82} ${72 - r * 0.58}a${r} ${r} 0 0 1 ${r * 1.64} 0`}
          className="tt-accl tt-blink"
          style={v({ '--ph': `${i * 110}deg`, '--rate': '540deg' })}
        />
      ))}
      <circle cx="80" cy="72" r="4" className="tt-acc" />
    </Svg>
  ),

  /* 2006: a cloud above racks of machines it can be rented from. */
  cloud: () => (
    <Svg>
      <path
        d="M42 60a18 18 0 0 1 4-34 24 24 0 0 1 44-6 20 20 0 0 1 28 16 16 16 0 0 1-2 24z"
        className="tt-body"
      />
      {[34, 70, 106].map((x, i) => (
        <g key={x}>
          <rect x={x} y="82" width="22" height="28" rx="2" className="tt-body" />
          <path d={`M${x + 4} 92H${x + 18}M${x + 4} 100H${x + 18}`} className="tt-dim" />
          <Lamp x={x + 6} y={87} ph={i * 130} r={1.8} />
          <path d={`M${x + 11} 80V68`} className="tt-accl tt-m tt-slide" style={v({ '--dy': '-4px', '--a': 0.1, '--b': 0.5 })} />
        </g>
      ))}
    </Svg>
  ),

  /* 2007: a phone and its grid of apps. */
  smartphone: () => (
    <Svg>
      <rect x="50" y="4" width="60" height="112" rx="11" className="tt-body" />
      <rect x="55" y="14" width="50" height="86" rx="4" className="tt-fill tt-dim" />
      {range(12).map((i) => (
        <rect
          key={i}
          x={59 + (i % 3) * 15.4}
          y={20 + Math.floor(i / 3) * 19}
          width="11"
          height="11"
          rx="3"
          className={i % 5 === 0 ? 'tt-acc tt-m tt-in' : 'tt-mute tt-m tt-in'}
          style={v({ '--a': (i * 0.025).toFixed(3), '--b': 0.2 })}
        />
      ))}
      <circle cx="80" cy="108" r="3.4" className="tt-dim" />
    </Svg>
  ),

  /* Today: a small network of nodes, thinking in layers. */
  ai: () => (
    <Svg>
      {AI_LAYERS.slice(0, -1).map((layer, index) =>
        layer.ys.map((y) =>
          AI_LAYERS[index + 1].ys.map((next) => (
            <path key={`${index}-${y}-${next}`} d={`M${layer.x} ${y}L${AI_LAYERS[index + 1].x} ${next}`} className="tt-dim tt-faint" />
          )),
        ),
      )}
      {AI_LAYERS.map((layer, index) =>
        layer.ys.map((y, i) => (
          <circle
            key={`${index}-${y}`}
            cx={layer.x}
            cy={y}
            r="6"
            className={index === 1 ? 'tt-acc tt-blink' : 'tt-body'}
            style={index === 1 ? v({ '--ph': `${i * 90}deg`, '--rate': '540deg' }) : undefined}
          />
        )),
      )}
      <path d="M140 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" className="tt-acc tt-m tt-spark" />
    </Svg>
  ),
};

/** The drawing for one technology. */
export function TechArt({ id }: { id: TechId }) {
  return <>{ART[id]()}</>;
}
