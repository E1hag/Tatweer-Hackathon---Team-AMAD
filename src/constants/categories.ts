export const CATEGORIES = [
  'Food & Produce',
  'Farm & Livestock',
  'Building & Construction',
  'Healthcare',
  'Home Services',
  'Electronics & Repair',
  'Transport',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];
