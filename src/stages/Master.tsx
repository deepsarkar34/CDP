import { motion } from 'framer-motion';
import { useState } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, StageHead } from '../components/ui';

const SHORT: Record<string, string> = { crm: 'CRM', rx: 'Rx', claims: 'Claims', ehr: 'EHR', digital: 'Digital', ref: 'Reference', mdm: 'MDM' };

export function Master({ local, v, deep }: StageProps) {
  const [sel, setSel] = useState<string | null>(null);
  const merged = local >= 1;
  const stamped = local >= 2;
  return (
    <>
      <StageHead
        eyebrow={`Step 4 · Master · ${v.layers.gold}`}
        title={merged ? 'One golden record' : 'Six clean records. Same doctor?'}
        lede="Matching rules and reference data decide these records are one real doctor, and issue one master ID."
      />
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: merged ? 'minmax(220px, 1fr) minmax(0, 1.5fr)' : '1fr', alignItems: 'start' }}>
        <motion.div layout style={{ display: 'grid', gap: 8, gridTemplateColumns: merged ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {scenario.masterSources.map(([id, name, how]) => (
            <motion.button
              layout
              key={id}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              onClick={() => setSel(sel === id ? null : id)}
              aria-pressed={sel === id}
              className="card"
              style={{ textAlign: 'left', cursor: 'pointer', padding: merged ? '8px 12px' : '14px 16px', borderColor: sel === id ? 'var(--teal)' : undefined, background: sel === id ? 'var(--teal-soft)' : undefined, gap: 2 }}
            >
              <motion.span layout="position" style={{ fontWeight: 600 }}>{name}</motion.span>
              <motion.span layout="position" className="muted" style={{ fontSize: 13 }}>{how}</motion.span>
            </motion.button>
          ))}
        </motion.div>

        {merged && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            style={{ border: '2px solid var(--teal)', borderRadius: 14, padding: 14, display: 'grid', gap: 4, position: 'relative' }}
          >
            <span className="eyebrow" style={{ marginBottom: 4 }}>Golden record</span>
            {scenario.golden.map(([k, val, srcs], i) => {
              const isId = k === 'Master ID';
              const hit = sel ? (srcs as string[]).includes(sel) : false;
              if (isId && !stamped) return null;
              return (
                <motion.div
                  key={k as string}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: sel && !hit ? 0.3 : 1, x: 0, scale: isId ? [1.4, 1] : 1 }}
                  transition={{ duration: 0.4, delay: isId ? 0 : 0.35 + i * 0.09 }}
                  style={{ display: 'grid', gridTemplateColumns: '170px minmax(0, 1fr) auto', gap: 10, alignItems: 'center', padding: '6px 8px', borderRadius: 8, background: hit || isId ? 'var(--teal-soft)' : 'transparent' }}
                >
                  <span className="muted" style={{ fontSize: 14 }}>{k}</span>
                  <span className="mono" style={{ fontSize: isId ? 18 : 14, fontWeight: isId ? 600 : 400, color: isId ? 'var(--teal)' : undefined, overflowWrap: 'anywhere' }}>{val}</span>
                  <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {(srcs as string[]).map(s => <span key={s} className="chip plain" style={{ fontSize: 11 }}>{SHORT[s]}</span>)}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      {stamped && (
        <motion.div className="note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <strong>Mastering decides who he is.</strong> Patient tokens stay separate and only add <em>counts</em> to Dr. Brown, never patient identities. Click a source to see what it contributed.
        </motion.div>
      )}
      <DeepDive show={deep} title="Match and survivorship rules">
        <table>
          <thead><tr><th>Rule</th><th>Logic</th><th>Confidence</th></tr></thead>
          <tbody>
            <tr><td>NPI exact</td><td><code>rx.npi = claims.rendering_npi = ehr.treating_npi</code></td><td>Deterministic</td></tr>
            <tr><td>CRM to NPI</td><td>Fuzzy name + standardized address + specialty</td><td>Scored, steward review below threshold</td></tr>
            <tr><td>Digital to CRM</td><td>Exact normalized email</td><td>Deterministic</td></tr>
            <tr><td>Survivorship</td><td>Name and address from reference data; email by recency; Rx fields from Rx source only</td><td>Per-field policy</td></tr>
          </tbody>
        </table>
        <p>Who runs it: {v.mdm}. The result always lands in the {v.layers.gold.toLowerCase()} layer.</p>
      </DeepDive>
    </>
  );
}
