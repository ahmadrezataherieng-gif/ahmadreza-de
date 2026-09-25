import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

import { crossingTech } from '@/content/crossings';
import { eras, type Era, type EraId } from '@/content/eras';
import type { ThemeId } from '@/lib/themes';
import { TECH_FROM, TECH_TO } from '@/components/journey/crossing-timing';
import { TechArt } from '@/components/journey/tech/TechArt';

interface CrossingTechProps {
  kind: EraId;
  fromTheme: ThemeId;
  toTheme: ThemeId;
}

/** The custom properties every part of a crossing with cards reads, set on its root. */
export function techStyle(kind: EraId): CSSProperties | undefined {
  const count = crossingTech[kind]?.length ?? 0;
  if (count === 0) return undefined;
  return { '--tech-n': count, '--tech-from': TECH_FROM, '--tech-to': TECH_TO } as CSSProperties;
}

/**
 * The technologies between two eras, one card each, in year order (BR-10).
 *
 * All of it is pre-built and hidden: the resolver marks the bridge with the card
 * that is current (`data-shot`), and CSS shows that card and its neighbours only.
 * Each card carries the palette of the era it is closest to, so the light and
 * the type change hands as the background does. Decorative and hidden from
 * assistive tech; `TechList` says the same in words.
 */
export function CrossingTechLayer({ kind, fromTheme, toTheme }: CrossingTechProps) {
  const t = useTranslations('crossings');
  const tEras = useTranslations('eras');
  const techs = crossingTech[kind];
  if (!techs) return null;

  const slot = (TECH_TO - TECH_FROM) / techs.length;
  const leaving = eras.find((era) => era.id === kind);
  const entering = leaving ? eras[eras.indexOf(leaving) + 1] : undefined;
  const yearOf = (era: Era | undefined) =>
    era ? (era.yearLabelKey ? tEras(era.yearLabelKey) : era.year) : '';

  return (
    <div className="ao-bridge-tech">
      <p className="ao-tech-caption">{t('between')}</p>
      {techs.map((tech, index) => {
        const centre = TECH_FROM + (index + 0.5) * slot;
        return (
          <div
            key={tech.id}
            className="ao-shot"
            data-i={index}
            data-theme-scope={centre < 0.5 ? fromTheme : toTheme}
            style={{ '--i': index } as CSSProperties}
          >
            {typeof tech.when === 'number' ? (
              <span className="ao-shot-ghost" dir="ltr">
                {tech.when}
              </span>
            ) : null}
            <div className="ao-shot-card">
              <div className="ao-shot-art">
                <TechArt id={tech.id} />
              </div>
              <p className="ao-shot-year" dir="ltr">
                {typeof tech.when === 'number' ? tech.when : t(`when.${tech.when}`)}
              </p>
              <p className="ao-shot-name">
                {t(`techs.${tech.id}.name`)}
                {t.has(`techs.${tech.id}.note`) ? (
                  <span className="ao-shot-note">{t(`techs.${tech.id}.note`)}</span>
                ) : null}
              </p>
            </div>
          </div>
        );
      })}

      {/* Where the crossing is: the two eras and a mark for each card. */}
      <div className="ao-tech-rule">
        <span className="ao-tech-end" dir="ltr">
          {yearOf(leaving)}
        </span>
        <span className="ao-tech-track">
          <i className="ao-tech-line" />
          <i className="ao-tech-fill" />
          {techs.map((tech, index) => (
            <i key={tech.id} className="ao-tech-dot" style={{ '--i': index } as CSSProperties} />
          ))}
        </span>
        <span className="ao-tech-end" dir="ltr">
          {yearOf(entering)}
        </span>
      </div>
    </div>
  );
}

/**
 * The same technologies as a plain list: for assistive tech and search engines
 * always, and the only thing reduced motion needs besides the cards laid out.
 */
export function TechList({ kind }: { kind: EraId }) {
  const t = useTranslations('crossings');
  const techs = crossingTech[kind];
  if (!techs) return null;
  return (
    <ul className="ao-sr-only" aria-label={t('between')}>
      {techs.map((tech) => (
        <li key={tech.id}>
          {typeof tech.when === 'number' ? tech.when : t(`when.${tech.when}`)}: {t(`techs.${tech.id}.name`)}
          {t.has(`techs.${tech.id}.note`) ? `, ${t(`techs.${tech.id}.note`)}` : ''}
        </li>
      ))}
    </ul>
  );
}
