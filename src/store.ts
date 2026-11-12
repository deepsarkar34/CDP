import { create } from 'zustand';
import { BEATS, clampBeat, firstBeatOf } from './beats';
import { VENDOR_ORDER, type VendorId } from './vendors';
import scenario from './scenario/scenario.json';

export interface DemoState {
  beat: number;
  vendor: VendorId;
  deepDive: boolean;
  consent: boolean;
  startedAt: number | null;
}

export interface DemoActions {
  next: () => void;
  prev: () => void;
  jumpStep: (step: number) => void;
  setVendor: (v: VendorId) => void;
  cycleVendor: () => void;
  toggleDeepDive: () => void;
  toggleConsent: () => void;
  reset: () => void;
  /** Apply state received from another window (presenter sync). */
  hydrate: (s: Partial<DemoState>) => void;
}

export const initialState: DemoState = { beat: 0, vendor: 'neutral', deepDive: false, consent: true, startedAt: null };

const started = (s: DemoState) => s.startedAt ?? Date.now();

export const useDemo = create<DemoState & DemoActions>((set, get) => ({
  ...initialState,
  next: () => set(s => ({ beat: clampBeat(s.beat + 1), startedAt: started(s) })),
  prev: () => set(s => ({ beat: clampBeat(s.beat - 1) })),
  jumpStep: step => { const i = firstBeatOf(step); if (i >= 0) set(s => ({ beat: i, startedAt: started(s) })); },
  setVendor: vendor => set({ vendor }),
  cycleVendor: () => { const i = VENDOR_ORDER.indexOf(get().vendor); set({ vendor: VENDOR_ORDER[(i + 1) % VENDOR_ORDER.length] }); },
  toggleDeepDive: () => set(s => ({ deepDive: !s.deepDive })),
  toggleConsent: () => set(s => ({ consent: !s.consent })),
  reset: () => set({ ...initialState }),
  hydrate: s => set(s),
}));

export const currentBeat = (beat: number) => BEATS[beat];

/** Channel reach counts. Consent is a per-channel filter: it only affects email. */
export function channelCounts(consent: boolean) {
  const c = scenario.channels;
  return { ...c, email: consent ? c.email : c.email - 1 };
}

/** Which channels reach Dr. Brown himself. */
export function brownChannels(consent: boolean) {
  return { crm: true, email: consent, media: true, rt: true, web: true };
}
