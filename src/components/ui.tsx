import { AnimatePresence, motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

export function StageHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: ReactNode }) {
  return (
    <div className="stage-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p className="lede">{lede}</p>
    </div>
  );
}

/** Technical layer revealed with the D key. */
export function DeepDive({ show, title, children }: { show: boolean; title: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.section
          className="deep"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
          onAnimationComplete={def => { if (def && (def as { opacity?: number }).opacity === 1) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }}
          ref={ref}
        >
          <span className="eyebrow">Deep dive · {title}</span>
          {children}
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/** Fades content in once its beat is reached; keeps layout stable by reserving space. */
export function Reveal({ when, children, delay = 0, y = 10 }: { when: boolean; children: ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={false} animate={when ? { opacity: 1, y: 0 } : { opacity: 0, y }} transition={{ duration: 0.4, delay: when ? delay : 0 }} style={{ pointerEvents: when ? 'auto' : 'none' }} aria-hidden={!when}>
      {children}
    </motion.div>
  );
}

/** Animated number counter. */
export function Counter({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, n => Math.round(n).toLocaleString('en-US'));
  useEffect(() => { const c = animate(mv, value, { duration: 0.8, ease: 'easeOut' }); return () => c.stop(); }, [value, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}
