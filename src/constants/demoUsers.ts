import type { Profile } from '@/types/database';

export const demoUsers: Pick<Profile, 'id' | 'full_name' | 'role' | 'area'>[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    full_name: 'Ahmad Al Mansoori',
    role: 'resident',
    area: "Al Qua'a North",
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    full_name: 'Fatima Al Zaabi',
    role: 'resident',
    area: "Al Qua'a South",
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    full_name: 'Mohammed Al Rashdi',
    role: 'resident',
    area: "Al Qua'a Central",
  },
];
