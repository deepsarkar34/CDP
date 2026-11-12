import { motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Reveal, StageHead } from '../components/ui';

export function Capture({ local, deep }: StageProps) {
  const arrived = local >= 1;
  const flag = local >= 2;
  return (
    <>
      <StageHead
        eyebrow="Step 2 · Capture · Data sources"
        title="Five systems, five versions of him"
        lede="Each system sends its own version of Dr. Brown, in its own format, on its own schedule."
      />
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {scenario.sources.map((s, i) => (
          <div key={s.id} className="card" style={{ minHeight: 230 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <h3>{s.name}</h3>
              <span className="chip plain">{s.kind}</span>
            </div>
            <motion.div
              initial={false}
              animate={arrived ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
              transition={{ duration: 0.45, delay: arrived ? i * 0.18 : 0 }}
              style={{ display: 'grid', gap: 8 }}
            >
              <span className={`chip ${s.phi ? 'warn' : ''}`}>{s.cadence} · {s.records}</span>
              <dl className="kv">
                {s.fields.map(([k, val, bad]) => (
                  <div key={k as string} style={{ display: 'contents' }}>
                    <dt>{k}</dt>
                    <dd><span className={flag && bad ? 'hl-warn' : ''} style={{ transition: 'all .3s' }}>{val}</span></dd>
                  </div>
                ))}
              </dl>
            </motion.div>
            {!arrived && <span className="muted" style={{ fontSize: 13 }}>Waiting for feed…</span>}
          </div>
        ))}
      </div>
      <Reveal when={flag}>
        <div className="note">
          <strong>Amber means "disagrees with another system".</strong> Names, specialty codes, address and date formats all differ.
          Patient data (EHR, claims) arrives <em>already de-identified</em> by the vendor: no patient names, only a token. It matters to Dr. Brown only because it carries <em>his</em> NPI as the treating doctor.
        </div>
      </Reveal>
      <DeepDive show={deep} title="How the data arrives">
        <table>
          <thead><tr><th>Source</th><th>Mechanism</th><th>Cadence</th><th>Watch out for</th></tr></thead>
          <tbody>
            <tr><td>Veeva CRM</td><td>Nightly extract to warehouse</td><td>Daily</td><td>Duplicate accounts per rep territory</td></tr>
            <tr><td>IQVIA Rx</td><td>Licensed file, NPI-keyed</td><td>Weekly</td><td>Contract limits on how Rx data is used</td></tr>
            <tr><td>EHR / claims</td><td>Data partner, de-identified under HIPAA</td><td>Monthly</td><td>Vendor tokens only; expert determination</td></tr>
            <tr><td>Web / email</td><td>Tracking script stream; email platform export</td><td>Real time / daily</td><td>Anonymous cookies, consent flags</td></tr>
          </tbody>
        </table>
      </DeepDive>
    </>
  );
}
