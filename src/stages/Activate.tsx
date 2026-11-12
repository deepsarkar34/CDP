import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import type { VendorPack } from '../vendors';
import { DeepDive, StageHead } from '../components/ui';
import { brownChannels, channelCounts } from '../store';

type Ch = 'crm' | 'email' | 'media' | 'rt' | 'web';
const ORDER: Ch[] = ['crm', 'email', 'media', 'rt', 'web'];
const LABEL: Record<Ch, string> = { crm: 'Rep (CRM)', email: 'Email', media: 'HCP media', rt: 'Real-time triggers', web: 'Website and portal' };
const KIND: Record<Ch, 'push' | 'pull'> = { crm: 'push', email: 'push', media: 'push', rt: 'push', web: 'pull' };
const route = (v: VendorPack, c: Ch) => ({ crm: v.crmRoute, email: v.email, media: v.media, rt: v.realtime, web: v.personalization }[c]);

export function Activate({ local, v, deep, consent }: StageProps) {
  const [ch, setCh] = useState<Ch>('email');
  const titles = [
    'Push and pull: two ways to reach him',
    `What ${scenario.hcp.short} actually experiences`,
    'Live: he downloads the dosing guide',
    'Partner collaboration is not activation',
    'Six records. One doctor. Five channels.',
  ];
  return (
    <>
      <StageHead
        eyebrow={`Step 7 · Activate · ${v.activation}`}
        title={titles[local]}
        lede="Push channels receive a list from the CDP. Pull channels ask the CDP about one person, at the moment he shows up."
      />
      {v.partners?.activation && local < 3 && <span className="chip deep">Composable: activation runs through reverse ETL partners such as Hightouch or Census</span>}
      <AnimatePresence mode="wait">
        <motion.div key={local} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ display: 'grid', gap: 16 }}>
          {local === 0 && <SankeyPanel ch={ch} setCh={setCh} v={v} consent={consent} />}
          {local === 1 && <Experience consent={consent} />}
          {local === 2 && <LiveEvent consent={consent} v={v} />}
          {local === 3 && <CleanRoom v={v} />}
          {local === 4 && <Recap />}
        </motion.div>
      </AnimatePresence>
      <DeepDive show={deep} title="Connector per channel">
        <table>
          <thead><tr><th>Channel</th><th>Type</th><th>Route on {v.label === 'Vendor neutral' ? 'a typical stack' : v.label}</th></tr></thead>
          <tbody>{ORDER.map(c => <tr key={c}><td>{LABEL[c]}</td><td>{KIND[c]}</td><td>{route(v, c)}</td></tr>)}</tbody>
        </table>
      </DeepDive>
    </>
  );
}

/* ---------- Beat 0: Sankey ---------- */
function SankeyPanel({ ch, setCh, v, consent }: { ch: Ch; setCh: (c: Ch) => void; v: VendorPack; consent: boolean }) {
  const n = channelCounts(consent);
  const W = 1000, top = 50, H = 320, nw = 14, gapR = 16, gapM = 34;
  const pushT = ORDER.filter(c => KIND[c] === 'push').reduce((a, c) => a + n[c], 0);
  const total = pushT + n.web;
  const k = Math.min((H - gapR * (ORDER.length - 1)) / total, (H - gapM) / total);
  const X = [170, 470, 760];
  const stack = (vals: number[], gap: number) => {
    const hs = vals.map(x => x * k); const tot = hs.reduce((a, b) => a + b, 0) + gap * (vals.length - 1);
    let y = top + (H - tot) / 2; return hs.map(h => { const o = { y, h }; y += h + gap; return o; });
  };
  const L = stack([total], 0)[0], M = stack([pushT, n.web], gapM), R = stack(ORDER.map(c => n[c]), gapR);
  const path = (x0: number, y0: number, x1: number, y1: number, h: number) => {
    const xm = (x0 + x1) / 2;
    return `M${x0},${y0} C${xm},${y0} ${xm},${y1} ${x1},${y1} L${x1},${y1 + h} C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h} Z`;
  };
  let py = M[0].y;
  const bands = ORDER.map((c, i) => {
    const d = KIND[c] === 'push' ? path(X[1] + nw, py, X[2], R[i].y, R[i].h) : path(X[1] + nw, M[1].y, X[2], R[i].y, R[i].h);
    if (KIND[c] === 'push') py += R[i].h;
    return { c, d, i };
  });
  const col = (c: Ch) => (KIND[c] === 'push' ? 'var(--teal)' : 'var(--pull)');
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'minmax(0, 1.7fr) minmax(260px, 1fr)', alignItems: 'start' }}>
      <div>
        <svg viewBox={`0 0 ${W} ${top + H + 40}`} role="img" aria-label="Activation flow from the segment to five channels" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <motion.path d={path(X[0] + nw, L.y, X[1], M[0].y, M[0].h)} fill="var(--teal)" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.1 }} />
          <motion.path d={path(X[0] + nw, L.y + M[0].h, X[1], M[1].y, M[1].h)} fill="var(--pull)" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.2 }} />
          {bands.map(({ c, d, i }) => (
            <motion.path key={c} d={d} fill={col(c)} style={{ cursor: 'pointer' }} onClick={() => setCh(c)}
              initial={{ opacity: 0 }} animate={{ opacity: c === ch ? 0.65 : 0.22, d }} transition={{ delay: 0.35 + i * 0.12, duration: 0.4 }} />
          ))}
          <rect x={X[0]} y={L.y} width={nw} height={L.h} fill="var(--ink)" />
          <text x={X[0] - 10} y={L.y + L.h / 2 - 8} textAnchor="end" fontSize={18} fontWeight={600} fill="var(--ink)">{scenario.segment.name}</text>
          <text x={X[0] - 10} y={L.y + L.h / 2 + 10} textAnchor="end" fontSize={15} fill="var(--muted)">1,240 HCPs</text>
          <rect x={X[1]} y={M[0].y} width={nw} height={M[0].h} fill="var(--teal)" />
          <text x={X[1] + nw / 2} y={M[0].y - 22} textAnchor="middle" fontSize={16} fontWeight={700} fill="var(--teal)">PUSH</text>
          <text x={X[1] + nw / 2} y={M[0].y - 4} textAnchor="middle" fontSize={14} fill="var(--muted)">CDP sends a list</text>
          <rect x={X[1]} y={M[1].y} width={nw} height={M[1].h} fill="var(--pull)" />
          <text x={X[1] + nw / 2} y={M[1].y + M[1].h + 20} textAnchor="middle" fontSize={16} fontWeight={700} fill="var(--pull)">PULL</text>
          <text x={X[1] + nw / 2} y={M[1].y + M[1].h + 38} textAnchor="middle" fontSize={14} fill="var(--muted)">channel asks the CDP</text>
          {ORDER.map((c, i) => {
            const ly = R[i].y + R[i].h / 2;
            return (
              <g key={c} onClick={() => setCh(c)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label={LABEL[c]}
                onKeyDown={e => { if (e.key === 'Enter') setCh(c); }}>
                <rect x={X[2]} y={R[i].y} width={nw} height={Math.max(R[i].h, 3)} fill={col(c)} />
                <rect x={X[2] + nw + 4} y={ly - 16} width={200} height={32} fill="transparent" />
                <text x={X[2] + nw + 10} y={ly - 2} fontSize={18} fontWeight={c === ch ? 700 : 500} fill="var(--ink)">{LABEL[c]}</text>
                <text x={X[2] + nw + 10} y={ly + 17} fontSize={15} fill="var(--muted)">{n[c].toLocaleString('en-US')} HCPs</text>
              </g>
            );
          })}
        </svg>
        <p className="muted" style={{ fontSize: 13 }}>Band width = HCPs reached this cycle. One HCP can be in several channels, so channels add up to more than 1,240. Click a band.</p>
      </div>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <h3>{LABEL[ch]}</h3><span className={`chip ${KIND[ch] === 'pull' ? 'pull' : ''}`}>{KIND[ch] === 'pull' ? 'Pull' : 'Push'}</span>
        </div>
        <p style={{ fontSize: 14 }}><span className="muted">Route:</span> {route(v, ch)}</p>
        <p style={{ fontSize: 14 }}>{KIND[ch] === 'pull'
          ? 'Nothing is sent ahead of time. The site asks about one person the moment he arrives.'
          : ch === 'rt' ? 'Fires per event, within seconds, rather than per segment publish.'
          : 'The segment publishes; members and chosen fields are delivered to the channel.'}</p>
        {ch === 'email' && !consent && <span className="chip no">Email consent off: filtered out before delivery (979 HCPs)</span>}
      </div>
    </div>
  );
}

/* ---------- Beat 1: what he experiences ---------- */
function Experience({ consent }: { consent: boolean }) {
  const reach = brownChannels(consent);
  const cards: { c: Ch; body: ReactNode }[] = [
    { c: 'email', body: <><p className="muted" style={{ fontSize: 12 }}>From: {scenario.brand} Medical</p><p style={{ fontWeight: 600 }}>Dear Dr. Brown,</p><p style={{ fontSize: 13.5 }}>New retina dosing guidance, approved for ophthalmology specialists.</p></> },
    { c: 'crm', body: <><span className="chip warn">Suggestion for his rep</span><p style={{ fontSize: 13.5 }}>In-person visit due: high propensity (0.82), 81 days since last visit.</p></> },
    { c: 'media', body: <><span className="chip plain">Sponsored · HCP publisher</span><p style={{ fontSize: 13.5 }}>Retina campaign shown when he logs into a verified HCP site.</p></> },
    { c: 'web', body: <><span className="chip pull">Portal, personalized at load</span><p style={{ fontSize: 13.5 }}>Hero swaps from generic to the retina dosing block he was reading.</p></> },
  ];
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {cards.map(({ c, body }, i) => {
        const on = reach[c];
        return (
          <motion.div key={c} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: on ? 1 : 0.45, y: 0 }} transition={{ delay: i * 0.12 }}
            style={{ borderColor: on ? 'var(--teal)' : 'var(--no)', position: 'relative', minHeight: 170 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{LABEL[c]}</h3>
              <span className={`chip ${on ? '' : 'no'}`}>{on ? '✓ reached' : '✗ no consent'}</span>
            </div>
            <div style={{ display: 'grid', gap: 6, filter: on ? 'none' : 'grayscale(1)' }}>{body}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------- Beat 2: live event ---------- */
function LiveEvent({ consent, v }: { consent: boolean; v: VendorPack }) {
  const steps = [
    { t: '0.0s', s: 'Dr. Brown downloads the dosing guide on the HCP site.' },
    { t: '0.8s', s: `Tracking script streams the event into ${v.id === 'neutral' ? 'the CDP' : v.zones.cdp}.` },
    { t: '1.6s', s: `Rule matches: dosing guide download AND in ${scenario.segment.name}. (${v.realtime})` },
    { t: '2.4s', s: 'His rep is alerted to follow up.' },
    { t: '3.2s', s: consent ? 'He enters the follow-up email journey.' : 'Email journey skipped: no email consent.' },
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= steps.length) return;
    const t = setTimeout(() => setShown(s => s + 1), shown === 0 ? 400 : 800);
    return () => clearTimeout(t);
  }, [shown, steps.length]);
  return (
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'minmax(0, 1.3fr) minmax(260px, 1fr)', alignItems: 'start', position: 'relative' }}>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {steps.map((st, i) => (
          <motion.li key={i} initial={false} animate={{ opacity: i < shown ? 1 : 0.2, x: i < shown ? 0 : -8 }} transition={{ duration: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', background: i < shown ? 'var(--teal-soft)' : 'var(--surface)' }}>
            <span className="mono" style={{ color: 'var(--teal)', fontWeight: 500 }}>{st.t}</span>
            <span>{st.s}</span>
          </motion.li>
        ))}
        <li><button className="btn" onClick={() => setShown(0)}>↻ Replay event</button></li>
      </ol>
      <div style={{ display: 'grid', gap: 10 }}>
        <AnimatePresence>
          {shown >= 4 && (
            <motion.div key="rep" className="toast" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <strong>🔔 Rep alert · {scenario.hcp.short}</strong>
              <small>Downloaded the dosing guide 2s ago. In {scenario.segment.name}. Suggest a follow-up visit.</small>
            </motion.div>
          )}
          {shown >= 5 && (
            <motion.div key="email" className="toast" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              style={consent ? undefined : { borderColor: 'var(--no)', borderLeftColor: 'var(--no)' }}>
              <strong>{consent ? '✉ Email journey started' : '⛔ Email suppressed'}</strong>
              <small>{consent ? 'Follow-up: "Your dosing questions, answered." Sends in 1 hour.' : 'Consent is respected automatically, per channel.'}</small>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="note"><strong>Seconds, not overnight.</strong> This runs per event, not per segment publish. Results stream back as new events.</div>
      </div>
    </div>
  );
}

/* ---------- Beat 3: clean room ---------- */
function CleanRoom({ v }: { v: VendorPack }) {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      <div className="card">
        <span className="chip plain">Activation</span>
        <p style={{ fontSize: 16 }}>You send the publisher your list. They see your 1,240 target NPIs and run ads to them.</p>
      </div>
      <div className="card" style={{ borderColor: 'var(--teal)' }}>
        <span className="chip">{v.cleanRoom}</span>
        <p style={{ fontSize: 16 }}>Neither side hands over a list. Both datasets meet in a sealed room, matched on encrypted keys, and <strong>only totals come out</strong>.</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="count-big" style={{ fontSize: 48 }}>{scenario.cleanRoomOverlap}</span>
          <span className="muted">of your 1,240 are active on the publisher. No names seen by either side.</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Beat 4: recap ---------- */
function Recap() {
  const cols = [
    { n: '6', l: 'messy records', s: 'in 5 systems' },
    { n: '1', l: 'golden record', s: scenario.hcp.masterId },
    { n: '1', l: 'unified profile', s: 'known on every device' },
    { n: '1,240', l: 'in segment', s: scenario.segment.name },
    { n: '5', l: 'channels', s: 'each the right way' },
  ];
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
      {cols.map((c, i) => (
        <motion.div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 150px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.25 }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', justifyItems: 'center', padding: 18 }}>
            <span className="count-big" style={{ fontSize: 46 }}>{c.n}</span>
            <strong>{c.l}</strong>
            <span className="muted mono" style={{ fontSize: 12.5 }}>{c.s}</span>
          </div>
          {i < cols.length - 1 && <span className="muted" aria-hidden>→</span>}
        </motion.div>
      ))}
    </div>
  );
}
