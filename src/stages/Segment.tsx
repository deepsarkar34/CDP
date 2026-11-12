import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { Counter, Reveal, StageHead } from '../components/ui';

const MODE_TEXT = [
  'Runs on a schedule, such as daily. Right for email and CRM lists.',
  'Refreshes several times a day on recent data. Right for faster campaigns.',
  'Updates within seconds as events stream in. Right for web and triggers.',
];

export function Segment({ local, v, deep, consent }: StageProps) {
  const rules = scenario.segment.rules;
  const [passed, setPassed] = useState(local >= 1 ? rules.length : 0);
  const [mode, setMode] = useState(0);

  // Check rules one at a time once the beat is reached, so the count visibly falls.
  useEffect(() => {
    if (local < 1) { setPassed(0); return; }
    if (passed >= rules.length) return;
    const t = setTimeout(() => setPassed(p => p + 1), passed === 0 ? 300 : 750);
    return () => clearTimeout(t);
  }, [local, passed, rules.length]);

  const count = passed === 0 ? scenario.segment.universe : (rules[passed - 1][2] as number);
  return (
    <>
      <StageHead
        eyebrow={`Step 6 · Segment · ${v.zones.cdp}`}
        title={`${v.segment}: ${scenario.segment.name}`}
        lede="A segment is a saved rule set run against every unified profile. Dr. Brown qualifies if he passes every rule."
      />
      {v.partners?.segment && <span className="chip deep">Composable: audiences are built in a partner tool on top of the lakehouse</span>}
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0, 1.4fr) minmax(240px, 1fr)', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {rules.map(([label, his, , expr], i) => {
            const ok = passed > i;
            return (
              <motion.div key={label as string} initial={false} animate={{ borderColor: ok ? 'var(--ok)' : 'var(--line)', backgroundColor: ok ? 'var(--teal-soft)' : 'var(--surface)' }}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto 28px', gap: 12, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, padding: '11px 14px' }}>
                <span style={{ fontWeight: 500 }}>{label}{deep && <code className="mono muted" style={{ display: 'block', fontSize: 12 }}>{expr}</code>}</span>
                <span className="mono muted" style={{ fontSize: 13 }}>Dr. Brown: {his}</span>
                <motion.span initial={false} animate={{ scale: ok ? [0.4, 1.3, 1] : 0, opacity: ok ? 1 : 0 }} style={{ color: 'var(--ok)', fontWeight: 700, fontSize: 18 }} aria-label={ok ? 'passes' : 'not checked'}>✓</motion.span>
              </motion.div>
            );
          })}
        </div>
        <div className="card" style={{ justifyItems: 'center', textAlign: 'center', padding: 22 }}>
          <span className="eyebrow">HCPs matching</span>
          <Counter value={count} className="count-big" />
          <span className="muted" style={{ fontSize: 14 }}>{passed === 0 ? 'All eye-care HCPs in the universe' : passed < rules.length ? `after ${passed} of ${rules.length} rules` : 'qualify for Retina priority'}</span>
        </div>
      </div>
      <Reveal when={local >= 2}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span className="eyebrow">How often it publishes</span>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {v.publish.map((m, i) => (
              <button key={m} className="card" aria-pressed={mode === i} onClick={() => setMode(i)}
                style={{ textAlign: 'left', cursor: 'pointer', borderColor: mode === i ? 'var(--teal)' : undefined, background: mode === i ? 'var(--teal-soft)' : undefined, gap: 2 }}>
                <strong>{m}</strong><small className="muted">{MODE_TEXT[i]}</small>
              </button>
            ))}
          </div>
          <div className="note" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`chip ${consent ? '' : 'no'}`}>Email consent: {consent ? 'Yes' : 'No'}</span>
            <span>Consent is checked <strong>per channel</strong>, not in the segment. {consent
              ? 'Press C to see what happens if he withdraws email consent.'
              : 'He stays in the segment for his rep, media and portal, but is filtered out before anything reaches email.'}</span>
          </div>
        </div>
      </Reveal>
    </>
  );
}
