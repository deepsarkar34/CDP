import { AnimatePresence, motion } from 'framer-motion';
import { useDemo, currentBeat } from './store';
import { BEATS, STEPS } from './beats';
import { VENDORS, VENDOR_ORDER } from './vendors';
import { useKeyboard, openPresenter } from './keyboard';
import scenario from './scenario/scenario.json';
import { Hook } from './stages/Hook';
import { Capture } from './stages/Capture';
import { Clean } from './stages/Clean';
import { Master } from './stages/Master';
import { Resolve } from './stages/Resolve';
import { Segment } from './stages/Segment';
import { Activate } from './stages/Activate';
import type { StageProps } from './stages/types';
import type { ComponentType } from 'react';

const STAGES: ComponentType<StageProps>[] = [Hook, Capture, Clean, Master, Resolve, Segment, Activate];

const STATUS = [
  'Nobody knows yet that these six fragments are one person.',
  'Six separate, inconsistent records across five systems.',
  'His records now look alike. Patient identities are our own tokens.',
  `He officially exists once, as ${scenario.hcp.masterId}.`,
  'Recognized by email, login or a once-anonymous web visit.',
  `One of 1,240 HCPs in the ${scenario.segment.name} segment.`,
  'Reached by email, his rep, HCP media and his portal, each its own way.',
];

const ZONES: { key: 'sources' | 'engineering' | 'cdp' | 'channels'; steps: number[] }[] = [
  { key: 'sources', steps: [0, 1] },
  { key: 'engineering', steps: [2, 3] },
  { key: 'cdp', steps: [4, 5] },
  { key: 'channels', steps: [6] },
];

export default function App() {
  useKeyboard();
  const { beat, vendor, deepDive, consent, next, prev, jumpStep, setVendor, toggleDeepDive, toggleConsent } = useDemo();
  const b = currentBeat(beat);
  const v = VENDORS[vendor];
  const Stage = STAGES[b.step];
  const stepBeats = STEPS[b.step].notes.length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>The CDP journey</h1>
          <span className="muted">One HCP, end to end · {scenario.brand}</span>
        </div>
        <div className="seg" role="group" aria-label="Platform">
          {VENDOR_ORDER.map(id => (
            <button key={id} aria-pressed={vendor === id} onClick={() => setVendor(id)}>{VENDORS[id].label}</button>
          ))}
        </div>
        <button className={`pill ${deepDive ? 'on' : ''}`} onClick={toggleDeepDive} aria-pressed={deepDive}>
          Deep dive <kbd>D</kbd>
        </button>
        <button className={`pill ${consent ? '' : 'off'}`} onClick={toggleConsent} aria-pressed={!consent}>
          Email consent: {consent ? 'Yes' : 'No'} <kbd>C</kbd>
        </button>
        <button className="pill" onClick={openPresenter}>Presenter <kbd>P</kbd></button>
      </header>

      <nav className="map" aria-label="Pipeline">
        {ZONES.flatMap((z, zi) => {
          const zone = (
            <div key={z.key} className={`zone ${z.steps.includes(b.step) ? 'active' : ''}`}>
              <div className="zone-name" title={v.zones[z.key]}>
                {v.zones[z.key]}
                {z.key === 'cdp' && v.partners ? <span className="partner">+ partners</span> : null}
              </div>
              <div className="zone-steps">
                {z.steps.map(i => {
                  const cur = i === b.step;
                  return (
                    <button key={i} className={`step ${i < b.step ? 'done' : ''}`} aria-current={cur ? 'step' : undefined} onClick={() => jumpStep(i)}>
                      <span className="n">Step {i + 1}</span>
                      <span className="t">{STEPS[i].title}</span>
                      {cur && <span className="prog" style={{ width: `${((b.local + 1) / stepBeats) * 100}%` }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
          return zi < ZONES.length - 1 ? [zone, <div key={`a${zi}`} className="arrow" aria-hidden>→</div>] : [zone];
        })}
      </nav>

      <main className="stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={b.step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ display: 'grid', gap: 18, alignContent: 'start' }}
          >
            <Stage local={b.local} v={v} deep={deepDive} consent={consent} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="status">
        <div className="status-card">
          <div className="avatar" aria-hidden>{scenario.hcp.initials}</div>
          <p><strong>Where {scenario.hcp.short} is now.</strong> {STATUS[b.step]}</p>
        </div>
        <div className="dots" aria-label={`Beat ${beat + 1} of ${BEATS.length}`}>
          {Array.from({ length: stepBeats }, (_, i) => <span key={i} className={i <= b.local ? 'on' : ''} />)}
        </div>
        <div className="nav">
          <button className="btn" onClick={prev} disabled={beat === 0}>← Back</button>
          <button className="btn primary" onClick={next} disabled={beat === BEATS.length - 1}>Next →</button>
        </div>
      </footer>
    </div>
  );
}
