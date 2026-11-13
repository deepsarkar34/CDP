import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { useDemo, currentBeat } from './store';
import { BEATS, STEPS } from './beats';
import { VENDORS, VENDOR_ORDER } from './vendors';
import { useKeyboard, openPresenter } from './keyboard';
import scenario from './scenario/scenario.json';
import { Logo } from './components/Logo';
import { Hook } from './stages/Hook';
import { Capture } from './stages/Capture';
import { Clean } from './stages/Clean';
import { Master } from './stages/Master';
import { Resolve } from './stages/Resolve';
import { Segment } from './stages/Segment';
import { Activate } from './stages/Activate';
import type { StageProps } from './stages/types';

const STAGES: ComponentType<StageProps>[] = [Hook, Capture, Clean, Master, Resolve, Segment, Activate];

// Short, factual status per step: what the system knows about him right now.
const STATUS = [
  '6 fragments, not linked yet',
  '6 records in 5 systems',
  'Records standardized, patient IDs re-tokenized',
  `Master ID ${scenario.hcp.masterId}`,
  '5 identifiers on one profile',
  `In ${scenario.segment.name} (1,240 HCPs)`,
  'Reached in 5 channels',
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
      <div className="chrome">
        <header className="topbar">
          <div className="brand">
            <Logo />
            <span className="divider" aria-hidden />
            <span className="title"><b>Customer data platform</b> walkthrough for {scenario.brand}</span>
          </div>
          <div className="seg" role="group" aria-label="Platform">
            {VENDOR_ORDER.map(id => (
              <button key={id} aria-pressed={vendor === id} onClick={() => setVendor(id)}>{id === 'neutral' ? 'Any platform' : VENDORS[id].label}</button>
            ))}
          </div>
          <button className={`tog ${deepDive ? 'on' : ''}`} onClick={toggleDeepDive} aria-pressed={deepDive}><span className="dot" />Technical <kbd>D</kbd></button>
          <button className={`tog ${consent ? '' : 'alert'}`} onClick={toggleConsent} aria-pressed={!consent}><span className="dot" />Email consent {consent ? 'on' : 'off'} <kbd>C</kbd></button>
          <button className="tog" onClick={openPresenter}>Notes <kbd>P</kbd></button>
        </header>

        <nav className="map" aria-label="Pipeline">
          {ZONES.map(z => (
            <div key={z.key} className="zone">
              <div className="zone-name" title={v.zones[z.key]}>
                {v.zones[z.key]}{z.key === 'cdp' && v.partners ? <span className="partner">with partners</span> : null}
              </div>
              <div className="zone-steps">
                {z.steps.map(i => {
                  const cur = i === b.step;
                  return (
                    <button key={i} className={`step ${i < b.step ? 'done' : ''}`} aria-current={cur ? 'step' : undefined} onClick={() => jumpStep(i)}>
                      <span className="n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="t">{STEPS[i].title}</span>
                      {cur && <span className="prog" style={{ width: `${((b.local + 1) / stepBeats) * 100}%` }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <main className="stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={b.step} className="stage-inner"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            <Stage local={b.local} v={v} deep={deepDive} consent={consent} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="foot">
        <div className="who">
          <div className="avatar" aria-hidden>{scenario.hcp.initials}</div>
          <span><b style={{ fontWeight: 600 }}>{scenario.hcp.short}</b> <span className="muted">{STATUS[b.step]}</span></span>
        </div>
        <div className="dots" aria-label={`Beat ${beat + 1} of ${BEATS.length}`}>
          {Array.from({ length: stepBeats }, (_, i) => <span key={i} className={i <= b.local ? 'on' : ''} />)}
        </div>
        <button className="btn" onClick={prev} disabled={beat === 0}>Back</button>
        <button className="btn primary" onClick={next} disabled={beat === BEATS.length - 1}>Next ↗</button>
      </footer>
    </div>
  );
}
