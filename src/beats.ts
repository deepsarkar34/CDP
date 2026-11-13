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
    id: 'hook', title: 'Question', sub: 'One or six?', zone: 'sources',
    notes: [
      'Ask the room whether this is one doctor or six. Give them a few seconds. Each fragment comes from a system they already pay for.',
      'It is one person: Dr. John Brown, a retina specialist in Tarrytown. We will follow him from raw data to the channels that reach him.',
    ],
  },
  {
    id: 'capture', title: 'Capture', sub: 'Raw sources', zone: 'sources',
    notes: [
      'Five feeds: CRM, prescription data, EHR, claims, and web plus email. Each one knows a piece of him.',
      'They arrive on different schedules and in different formats. CRM nightly, Rx weekly, EHR and claims monthly, web in real time.',
      'Pink fields disagree with another source. The blue ones are patient IDs. Pharma licenses EHR and claims already de-identified, so we never see a patient name. Those rows only matter to Dr. Brown because they carry his NPI as the treating doctor.',
    ],
  },
  {
    id: 'clean', title: 'Clean', sub: 'Raw to clean', zone: 'engineering',
    notes: [
      'This is the raw layer, exactly as received. You cannot match anything on this yet.',
      'The pipeline standardizes each field: name parts, one specialty list, postal address, one date format, lowercase email.',
      'Duplicates inside a source are removed. The two CRM records become one.',
      'Patient tokens are swapped into our own token space and quality checks run. If asked about masking: masking only hides a value from some users, tokenization replaces it. Tokenization has to happen here, before anything reaches the CDP.',
    ],
  },
  {
    id: 'master', title: 'Master', sub: 'Golden record', zone: 'engineering',
    notes: [
      'Six clean records, still separate. The question is whether they are the same real doctor.',
      'Matching rules merge them into one golden record. Every field keeps a tag for the source it came from, so data stewards can audit it.',
      'He gets one master ID. Mastering is where we decide who he is. Click a source if someone asks what it contributed.',
    ],
  },
  {
    id: 'resolve', title: 'Resolve', sub: 'Identity resolution', zone: 'cdp',
    notes: [
      'The CDP reads the golden record from the warehouse without copying it, and starts his unified profile.',
      'It links each way he shows up digitally: his email, the email platform key, his portal login.',
      'Last week he browsed seven pages without logging in. Today those visits sit on an anonymous cookie.',
      'He logs into the portal and the cookie joins his profile, with all seven page views. Mastering decided who he is; this step recognizes him wherever he turns up. The scores underneath are computed on the profile.',
    ],
  },
  {
    id: 'segment', title: 'Segment', sub: 'Build and publish', zone: 'cdp',
    notes: [
      'A segment is a saved set of rules that runs against every profile. We start with 18,400 eye-care HCPs.',
      'Each rule narrows the list. Dr. Brown passes all four, and 1,240 HCPs qualify.',
      'Pick how often it refreshes. Then press C: consent is applied per channel at activation, so withdrawing email consent keeps him in the segment for his rep.',
    ],
  },
  {
    id: 'activate', title: 'Activate', sub: 'Push and pull', zone: 'channels',
    notes: [
      'Push channels get a list sent to them on each refresh. Pull channels, like the portal, ask about one person when he arrives. Click a band to show the route.',
      'This is what he actually sees: an email, a visit suggestion for his rep, a sponsored unit on a publisher site, and a personalized portal. Press C to show email dropping out on its own.',
      'He downloads the dosing guide. Watch the log: the event reaches the CDP, the rule matches, and his rep gets an alert in about two and a half seconds. This runs per event rather than per segment refresh.',
      'Clean rooms come up a lot. With activation the publisher gets your list. In a clean room both sides bring encrypted keys and only the overlap count comes out.',
      'Recap the journey in one breath, then open for questions.',
    ],
  },
];

export interface Beat { step: number; local: number; note: string }

export const BEATS: Beat[] = STEPS.flatMap((s, step) => s.notes.map((note, local) => ({ step, local, note })));

export const firstBeatOf = (step: number) => BEATS.findIndex(b => b.step === step);

export const clampBeat = (i: number) => Math.max(0, Math.min(BEATS.length - 1, i));

/** Target talk time in seconds (used by the presenter timer). */
export const TARGET_SECONDS = 12 * 60;
