import { AnimatePresence, motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Reveal, StageHead } from '../components/ui';

// Which beat cleans each row: 1 = standardize, 2 = dedupe, 3 = tokenize + quality.
const ROW_BEAT: Record<string, number> = { Duplicates: 2, 'Patient identity': 3, 'Quality checks': 3 };

export function Clean({ local, v, deep }: StageProps) {
  const token = `${scenario.tokenPrefix} token ${scenario.tokenPrefix}_T41C9`;
  const rows = scenario.clean.map(r => (r[2] === '{TOKEN}' ? [r[0], r[1], token, r[3]] : r));
  const cleanedCount = rows.filter(r => local >= (ROW_BEAT[r[0]] ?? 1)).length;
  return (
    <>
      <StageHead
        eyebrow={`Step 3 · Clean · ${v.zones.engineering}`}
        title={local === 0 ? `${v.layers.bronze}: exactly as it landed` : `${v.layers.bronze} → ${v.layers.silver}`}
        lede="Raw data lands untouched. The pipeline cleans, standardizes, removes duplicates and re-tokenizes anything that could identify a patient."
      />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="chip plain">{v.layers.bronze}</span>
        <motion.span animate={{ opacity: local > 0 ? 1 : 0.3 }}>→</motion.span>
        <motion.span className="chip" animate={{ opacity: local > 0 ? 1 : 0.3 }}>{v.layers.silver}</motion.span>
        <span className="muted" style={{ marginLeft: 'auto', fontSize: 14 }}>{cleanedCount} of {rows.length} fields clean</span>
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.map(([field, raw, clean, rule]) => {
          const done = local >= (ROW_BEAT[field] ?? 1);
          return (
            <motion.div
              key={field}
              layout
              style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 170px) minmax(0, 1fr) minmax(0, .9fr)', gap: 14, alignItems: 'center', padding: '6px 12px', borderRadius: 10, border: '1px solid var(--line)', background: done ? 'var(--teal-soft)' : 'var(--surface)', transition: 'background .4s' }}
            >
              <span style={{ fontWeight: 600 }}>{field}</span>
              <span className="mono" style={{ fontSize: 14, position: 'relative', minHeight: 22 }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={done ? 'c' : 'r'}
                    initial={{ opacity: 0, filter: 'blur(4px)', y: 6 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    exit={{ opacity: 0, filter: 'blur(4px)', y: -6 }}
                    transition={{ duration: 0.35 }}
                    style={{ display: 'inline-block', color: done ? 'var(--teal)' : 'var(--muted)', fontWeight: done ? 500 : 400 }}
                  >
                    {done ? clean : raw}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="muted" style={{ fontSize: 13.5 }}>{done ? `✓ ${rule}` : ''}</span>
            </motion.div>
          );
        })}
      </div>
      <Reveal when={local >= 3}>
        <div className="note">
          <strong>Tokenization vs masking.</strong> Tokenization changes the data itself: a patient becomes a token you can link across files but cannot reverse.
          Masking only hides a field from some users. Tokenization belongs here, <em>before</em> anything reaches the CDP.
        </div>
      </Reveal>
      <DeepDive show={deep} title="Pipeline rules">
        <table>
          <thead><tr><th>Layer</th><th>What happens</th><th>Typical tooling</th></tr></thead>
          <tbody>
            <tr><td>{v.layers.bronze}</td><td>Append-only raw copy, schema-on-read, full lineage</td><td>Ingestion jobs, CDC, file loaders</td></tr>
            <tr><td>{v.layers.silver}</td><td>Standardize, dedupe within source, validate NPI check digit, re-tokenize</td><td>SQL/dbt models, address &amp; name parsing, tokenization vendor</td></tr>
            <tr><td>Quality gate</td><td>Records failing required fields are quarantined, not dropped</td><td>Data quality tests and alerts</td></tr>
          </tbody>
        </table>
      </DeepDive>
    </>
  );
}
