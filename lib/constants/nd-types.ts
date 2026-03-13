export const ND_TYPE_OPTIONS = [
  { value: 'neurotypical', label: 'Neurotypical' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'autistic', label: 'Autistic' },
  { value: 'dyslexic', label: 'Dyslexic' },
  { value: 'dyspraxic', label: 'Dyspraxic' },
  { value: 'dyscalculic', label: 'Dyscalculic' },
  { value: 'dysgraphic', label: 'Dysgraphic' },
  { value: 'tourette-syndrome', label: 'Tourette syndrome' },
  { value: 'ocd', label: 'OCD' },
  {
    value: 'auditory-processing-disorder',
    label: 'Auditory processing disorder',
  },
  {
    value: 'language-processing-disorder',
    label: 'Language processing disorder',
  },
  { value: 'other', label: 'Other' },
] as const;

export type NdType = (typeof ND_TYPE_OPTIONS)[number]['value'];
