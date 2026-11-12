// The demo script. Each beat is one press of →. Stages render from their local beat index.

export type StepId = 'hook' | 'capture' | 'clean' | 'master' | 'resolve' | 'segment' | 'activate';

export interface StepDef {
  id: StepId;
  title: string;
  sub: string;
  zone: 'sources' | 'engineering' | 'cdp' | 'channels';
  /** Presenter notes, one per beat. Length defines the number of beats in the step. */
  notes: string[];
}

export const STEPS: StepDef[] = [
  {
    id: 'hook', title: 'The question', sub: 'One or six?', zone: 'sources',
    notes: [
      'Ask the room: "Is this one doctor, or six?" Let them guess. Each tag comes from a different system.',
      'Reveal: it is one person. Dr. Brown, retina specialist. Today we follow him end to end.',
    ],
  },
  {
    id: 'capture', title: 'Capture', sub: 'Raw sources', zone: 'sources',
    notes: [
      'Five systems each know a piece of Dr. Brown. CRM, prescriptions, EHR, claims, web and email.',
      'Each sends its own version, in its own format, on its own schedule.',
      'The amber fields disagree. Note patient data arrives already de-identified: only his NPI links it to him.',
    ],
  },
  {
    id: 'clean', title: 'Clean', sub: 'Raw to clean', zone: 'engineering',
    notes: [
      'This is what lands in the raw layer, untouched. Nobody could match on this yet.',
      'The pipeline standardizes every field: names, specialty codes, addresses, dates.',
      'Duplicates inside a source collapse. Two CRM records become one.',
      'Patient tokens are swapped into our own token space, and quality checks run. Tokenization happens here, before the CDP.',
    ],
  },
  {
    id: 'master', title: 'Master', sub: 'Golden record', zone: 'engineering',
    notes: [
      'Six clean records, still separate. Matching rules decide whether they are one real doctor.',
      'They merge into one golden record. Each field keeps a tag showing which source won.',
      'He gets one master ID. Mastering decides WHO he is. Click any source to show its contribution.',
    ],
  },
  {
    id: 'resolve', title: 'Resolve', sub: 'Identity resolution', zone: 'cdp',
    notes: [
      'The CDP reads the golden record without copying it, and starts a unified profile.',
      'It links every known way he shows up: email, email platform key, portal login.',
      'But last week he browsed anonymously. Seven page views, attached only to a cookie.',
      'He logs into the portal. The cookie snaps onto his profile and the seven views join his history. Insights compute on top.',
    ],
  },
  {
    id: 'segment', title: 'Segment', sub: 'Build and publish', zone: 'cdp',
    notes: [
      'A segment is a saved rule set run against every profile. Start with all 18,400 eye-care HCPs.',
      'Each rule narrows it. Dr. Brown passes all four. 1,240 HCPs qualify.',
      'Choose how often it refreshes. Press C to show consent: it filters per channel, not per segment.',
    ],
  },
  {
    id: 'activate', title: 'Activate', sub: 'Push and pull', zone: 'channels',
    notes: [
      'Push channels get a list sent to them. Pull channels ask about one person at the moment he arrives.',
      'What Dr. Brown actually experiences in each channel. Press C again to show consent removing email only.',
      'Live moment: he downloads the dosing guide. Watch it travel. Seconds, not overnight.',
      'Clean room is not activation. No list changes hands, only totals come out.',
      'Recap: six messy records, one doctor, five channels, each the right way.',
    ],
  },
];

export interface Beat { step: number; local: number; note: string }

export const BEATS: Beat[] = STEPS.flatMap((s, step) => s.notes.map((note, local) => ({ step, local, note })));

export const firstBeatOf = (step: number) => BEATS.findIndex(b => b.step === step);

export const clampBeat = (i: number) => Math.max(0, Math.min(BEATS.length - 1, i));

/** Target talk time in seconds (used by the presenter timer). */
export const TARGET_SECONDS = 12 * 60;
