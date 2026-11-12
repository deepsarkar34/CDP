import { motion } from 'framer-motion';
import scenario from '../scenario/scenario.json';
import type { StageProps } from './types';
import { StageHead } from '../components/ui';

// Scatter positions (% of the field) for the six fragments.
const SPOTS = [[8, 10], [58, 4], [72, 46], [40, 70], [4, 58], [30, 30]];
const ROT = [-6, 4, -3, 5, 3, -4];

export function Hook({ local }: StageProps) {
  const merged = local >= 1;
  return (
    <>
      <StageHead
        eyebrow="Step 1 · The question"
        title={merged ? `It's one person: ${scenario.hcp.short}` : 'Is this one doctor, or six?'}
        lede={merged
          ? `${scenario.hcp.full}, retina specialist. Every system knew a piece of him. A CDP is how you finally see the whole person, and act on it.`
          : 'Each tag below comes from a different system your teams already use.'}
      />
      <div style={{ position: 'relative', height: 380 }}>
        {scenario.hookVariants.map((t, i) => (
          <motion.div
            key={t}
            className="card mono"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={merged
              ? { opacity: 0, left: '50%', top: '42%', x: '-50%', rotate: 0, scale: 0.6 }
              : { opacity: 1, left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%`, x: '0%', rotate: ROT[i], scale: 1 }}
            transition={{ duration: 0.7, delay: merged ? i * 0.06 : i * 0.12, ease: 'easeInOut' }}
            style={{ position: 'absolute', fontSize: 'clamp(15px, 1.8vw, 20px)', padding: '12px 16px', whiteSpace: 'nowrap', borderStyle: 'dashed' }}
          >
            {t}
          </motion.div>
        ))}
        <motion.div
          initial={false}
          animate={merged ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.5, delay: merged ? 0.55 : 0 }}
          style={{ position: 'absolute', left: 0, right: 0, top: '28%', display: 'grid', justifyItems: 'center', gap: 10 }}
        >
          <div className="avatar" style={{ width: 84, height: 84, fontSize: 30 }}>{scenario.hcp.initials}</div>
          <h3 style={{ fontSize: 30 }}>{scenario.hcp.full}</h3>
          <span className="chip" style={{ justifySelf: 'center' }}>{scenario.hcp.specialty}</span>
        </motion.div>
      </div>
    </>
  );
}
