// ALL shoulder clinical content, confirmed by Raúl.
// The engine reads thresholds from here; nothing clinical is hard-coded elsewhere.

import type {
  CheckInThresholds,
  ExclusionQuestion,
  Irritability,
  IrritabilityQuestion,
  Level,
  LevelNumber,
  Region,
  RedFlag,
} from '../types'

const redFlags: RedFlag[] = [
  {
    id: 'trauma',
    question:
      'Did the pain start after a fall or blow, with a visible deformity or being unable to lift the arm?',
    urgency: 'urgent',
    referralCopy: 'Go to A&E / urgent care today.',
  },
  {
    id: 'cardiac',
    question:
      'Does the pain come with exertion together with chest pain, shortness of breath or a cold sweat?',
    urgency: 'emergency',
    referralCopy: 'Call the emergency number (112) now.',
  },
  {
    id: 'infection',
    question: 'Do you have a fever, or is the shoulder red, hot and swollen?',
    urgency: 'urgent',
    referralCopy: 'See a doctor today.',
  },
  {
    id: 'systemic',
    question:
      'Have you had cancer, lost weight without trying, or do you have constant pain at night that no position eases?',
    urgency: 'gp',
    referralCopy: 'Book an appointment with your GP.',
  },
  {
    id: 'neuro',
    question:
      'Do you have tingling or numbness spreading down the arm, or weakness that is getting worse?',
    urgency: 'doctor',
    referralCopy: 'See a doctor before starting exercises.',
  },
]

const exclusions: ExclusionQuestion[] = [
  {
    id: 'surgery',
    question: 'Have you had shoulder surgery in the last few months?',
    outcomeCopy: "Follow your surgeon's rehab protocol.",
  },
  {
    id: 'passiveRom',
    question:
      'Is the movement very limited even when someone else moves your arm, especially turning it outwards?',
    outcomeCopy:
      'Get an in-person assessment: this needs a hands-on exam (possible stiff / frozen shoulder).',
  },
]

const irritabilityQuestions: IrritabilityQuestion[] = [
  {
    id: 'painAtRest',
    question: 'Do you have pain at rest?',
    options: [
      { label: 'Yes', level: 'high' },
      { label: 'Sometimes', level: 'moderate' },
      { label: 'No', level: 'low' },
    ],
  },
  {
    id: 'nightWaking',
    question: 'Does the pain wake you at night?',
    options: [
      { label: 'Almost every night', level: 'high' },
      { label: 'Sometimes', level: 'moderate' },
      { label: 'Rarely', level: 'low' },
    ],
  },
  {
    id: 'painAfterActivity',
    question: 'After activity, how long does the pain last?',
    options: [
      { label: 'Hours', level: 'high' },
      { label: 'Less than 1 hour', level: 'moderate' },
      { label: 'Minutes', level: 'low' },
    ],
  },
]

const levels: Level[] = [
  {
    number: 1,
    name: 'Isometrics',
    frequency: 'daily',
    reducedLoad: '5 × 20 s at lighter effort',
    exercises: [
      {
        id: 'wall-external-rotation',
        name: 'Wall external rotation (isometric)',
        dosage: '5 × 30 s at submaximal effort, no more than mild discomfort.',
        cue: 'Elbow bent at 90° against your side, press the back of your hand into a wall without moving.',
      },
      {
        id: 'wall-abduction',
        name: 'Wall abduction (isometric)',
        dosage: '5 × 30 s.',
        cue: 'Stand side-on to a wall, press the outside of your elbow into it as if lifting the arm sideways.',
      },
    ],
  },
  {
    number: 2,
    name: 'Light load',
    frequency: 'every other day',
    reducedLoad: '2 × 10 with a lighter band',
    exercises: [
      {
        id: 'band-external-rotation',
        name: 'Band external rotation',
        dosage: '3 × 12–15.',
        cue: 'Elbow tucked to your side, rotate the hand outwards slowly.',
      },
      {
        id: 'band-row',
        name: 'Band row',
        dosage: '3 × 12–15.',
        cue: 'Pull your elbows back and squeeze your shoulder blades together.',
      },
      {
        id: 'scaption',
        name: 'Scaption to 90°',
        dosage: '3 × 12–15.',
        cue: 'Lift the arms forward at a slight angle, thumbs up, up to shoulder height.',
      },
    ],
  },
  {
    number: 3,
    name: 'Progressive load',
    frequency: 'every other day',
    reducedLoad: '3 × 8–10 with a lighter weight',
    exercises: [
      {
        id: 'progressive-external-rotation',
        name: 'Heavier band or dumbbell external rotation',
        dosage: '3 × 6–8.',
        cue: 'Elbow tucked to your side, rotate the hand outwards slowly.',
      },
      {
        id: 'overhead-press',
        name: 'Light overhead press',
        dosage: '3 × 6–8.',
        cue: 'Press up without shrugging; stop before pain rises.',
      },
      {
        id: 'incline-push-up',
        name: 'Incline push-up',
        dosage: '3 × 6–8.',
        cue: 'Hands on a table or wall, body in a straight line.',
      },
    ],
  },
]

const startingLevel: Record<Irritability, LevelNumber> = {
  high: 1,
  moderate: 2,
  low: 2,
}

const checkInThresholds: CheckInThresholds = {
  flarePain: 4,
  goodResponsePain: 3,
}

export const shoulder: Region = {
  id: 'shoulder',
  name: 'Shoulder',
  redFlags,
  exclusions,
  irritabilityQuestions,
  levels,
  startingLevel,
  startingLevelNote: 'Level 3 if Level 2 feels easy',
  checkInThresholds,
  planNote: 'No improvement after about 6 weeks? Get an in-person assessment.',
  checkInMessages: {
    up: 'Good news: the shoulder is responding, so the plan moves to the next step.',
    stay: 'Same level for now. The shoulder is settling, and that is the aim at this stage.',
    reduceLoad:
      'A small flare: the load is reduced for this week to let the shoulder settle down.',
    restoreLoad:
      'The shoulder has settled back down, so the normal load for this level is back on.',
    down: 'We step back a level for now. Easier exercises while the shoulder recovers.',
  },
}
