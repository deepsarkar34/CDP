import { motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { DeepDive, Reveal, StageHead } from '../components/ui';

const CX = 340, CY = 170;
interface Node { x: number; y: number; k: string; val: string; rule: string; at: number; cookie?: boolean }

export function Resolve({ local, v, deep }: StageProps) {
  const loggedIn = local >= 3;
  const nodes: Node[] = [
    { x: 140, y: 60, k: 'Master ID', val: scenario.hcp.masterId, rule: 'from golden record', at: 0 },
    { x: 540, y: 60, k: 'Email', val: 'jbrown@retinaclinic.example', rule: 'exact email', at: 1 },
    { x: 540, y: 280, k: 'Email platform key', val: 'SUB-55120', rule: 'joins via email', at: 1 },
    { x: 140, y: 280, k: 'Portal login', val: 'drbrown.ret', rule: 'master ID at sign-up', at: 1 },
    { x: 340, y: 335, k: 'Web cookie', val: 'ck_9f2a71', rule: loggedIn ? 'linked at login' : 'anonymous', at: 2, cookie: true },
  ];
  const cookie = nodes[4];
  return (
    <>
      <StageHead
        eyebrow={`Step 5 · Resolve · ${v.zones.cdp}`}
        title={loggedIn ? 'Recognized, even from an anonymous visit' : 'Every way he shows up, linked to one profile'}
        lede={<>The CDP reads the golden record ({v.ingest.toLowerCase()}), then {v.identity.toLowerCase()} links each digital identifier to one {v.profile.toLowerCase()}.</>}
      />
      {v.partners?.identity && <span className="chip deep">Composable: identity comes from a partner or Databricks CustomerLake (preview)</span>}
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0, 1.6fr) minmax(260px, 1fr)', alignItems: 'start' }} className="resolve-grid">
        <svg viewBox="0 0 680 370" role="img" aria-label="Identity graph" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {nodes.map(n => {
            const show = local >= n.at;
            const dashed = n.cookie && !loggedIn;
            const mx = (CX + n.x) / 2, my = (CY + n.y) / 2;
            return (
              <motion.g key={n.k} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.5 }}>
                <motion.line x1={CX} y1={CY} x2={n.x} y2={n.y} stroke="var(--teal)" strokeWidth={dashed ? 1.5 : 2.2}
                  strokeDasharray={dashed ? '6 6' : '0'} initial={false} animate={{ pathLength: show ? 1 : 0, opacity: dashed ? 0.5 : 1 }} transition={{ duration: 0.6 }} />
                <rect x={mx - 66} y={my - 11} width={132} height={22} rx={11} fill="var(--surface)" stroke="var(--line)" />
                <text x={mx} y={my + 4} textAnchor="middle" fontSize={11.5} fill="var(--muted)">{n.rule}</text>
                <motion.rect x={n.x - 132} y={n.y - 26} width={264} height={52} rx={10} fill="var(--surface)"
                  stroke={dashed ? 'var(--line)' : 'var(--teal)'} strokeWidth={1.5} strokeDasharray={dashed ? '4 4' : '0'}
                  animate={n.cookie && loggedIn ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 0.5 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
                <text x={n.x} y={n.y - 6} textAnchor="middle" fontSize={12} fill="var(--muted)">{n.k}</text>
                <text x={n.x} y={n.y + 13} textAnchor="middle" fontSize={12.5} fill="var(--ink)" style={{ fontFamily: 'var(--mono)' }}>{n.val}</text>
              </motion.g>
            );
          })}
          {/* Seven anonymous page views travel from the cookie into the profile at login */}
          {Array.from({ length: 7 }, (_, i) => {
            const ox = cookie.x - 90 + i * 30, oy = cookie.y + 34;
            return (
              <motion.circle key={i} r={6} fill="var(--amber)" initial={false}
                animate={local < 2 ? { cx: ox, cy: oy, opacity: 0 } : loggedIn ? { cx: CX, cy: CY, opacity: [1, 1, 0] } : { cx: ox, cy: oy, opacity: 1 }}
                transition={{ duration: loggedIn ? 0.9 : 0.4, delay: loggedIn ? 0.3 + i * 0.08 : i * 0.05 }} />
            );
          })}
          <circle cx={CX} cy={CY} r={56} fill="var(--teal)" />
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--on-teal)">{scenario.hcp.short}</text>
          <text x={CX} y={CY + 13} textAnchor="middle" fontSize={11.5} fill="var(--on-teal)">{v.profile.length > 22 ? 'Unified profile' : v.profile}</text>
        </svg>
        <div style={{ display: 'grid', gap: 10 }}>
          <Reveal when={local >= 2}>
            <div className="note">
              {loggedIn
                ? <><strong>Login happened.</strong> His 7 earlier anonymous page views are now on his profile: dosing guide twice, MOA video, safety data.</>
                : <><strong>Before login,</strong> a week of browsing sits on an anonymous cookie. Nobody knows it was him.</>}
            </div>
          </Reveal>
          <Reveal when={loggedIn} delay={1}>
            <div className="card">
              <span className="eyebrow">On his profile · {v.insights}</span>
              <dl className="kv">
                {scenario.insights.map(([k, val, kind]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <dt>{k}</dt>
                    <dd>{val} <span className="muted" style={{ fontFamily: 'var(--body)', fontSize: 11.5 }}>· {kind === 'model' ? 'model score' : kind === 'consent' ? 'ingested consent' : 'calculated'}</span></dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
      <DeepDive show={deep} title={v.identity}>
        <table>
          <thead><tr><th>Concept</th><th>On {v.label === 'Vendor neutral' ? 'a typical CDP' : v.label}</th></tr></thead>
          <tbody>
            <tr><td>How the gold layer arrives</td><td>{v.ingest}</td></tr>
            <tr><td>Data model</td><td>{v.dataModel}</td></tr>
            <tr><td>Identity rules</td><td>Exact master ID; exact normalized email; login to master ID; cookie to login (deterministic)</td></tr>
            <tr><td>The profile</td><td>{v.profile}: a container for linking with its own technical key. His business ID stays <code>{scenario.hcp.masterId}</code>.</td></tr>
          </tbody>
        </table>
        <p>Mastering decides <em>who</em> he is. Identity resolution <em>recognizes</em> him across emails, logins and cookies.</p>
      </DeepDive>
    </>
  );
}
