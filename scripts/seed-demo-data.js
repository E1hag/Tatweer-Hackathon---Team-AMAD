const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const env = {};

  if (!fs.existsSync(envPath)) {
    return env;
  }

  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
  }

  return env;
}

const profiles = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Maryam',
    role: 'resident',
    area: 'Al Qua’a farms',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Saeed',
    role: 'resident',
    area: 'Al Qua’a center',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Al Ain Pickup Helper',
    role: 'business',
    area: 'Al Ain route',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Aspiring Farm Services',
    role: 'aspiring_business',
    area: 'Al Qua’a farms',
  },
];

const requests = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Camel feed delivery from Al Ain',
    description: 'Looking for someone who can bring two bags of camel feed from Al Ain this week.',
    category: 'Farm supplies',
    area: 'Al Qua’a farms',
    needed_by: '2026-07-02',
    urgency: 'this_week',
    status: 'demand_growing',
    created_by: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Shared pickup from Al Ain',
    description: 'Several families need a shared pickup for household items after Friday prayers.',
    category: 'Transport',
    area: 'Al Qua’a center',
    needed_by: '2026-07-03',
    urgency: 'this_week',
    status: 'demand_growing',
    created_by: '00000000-0000-0000-0000-000000000002',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Mobile mechanic for farm vehicle',
    description: 'A farm vehicle will not start and needs a mobile mechanic who can visit on-site.',
    category: 'Vehicle repair',
    area: 'Al Qua’a farms',
    needed_by: '2026-06-30',
    urgency: 'today',
    status: 'open',
    created_by: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Local guide for stargazing visitors',
    description: 'Visitors are asking for a trusted local guide for an evening stargazing trip.',
    category: 'Tourism',
    area: 'Al Qua’a desert',
    needed_by: '2026-07-05',
    urgency: 'flexible',
    status: 'demand_growing',
    created_by: '00000000-0000-0000-0000-000000000002',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    title: 'Food for family gathering',
    description: 'Need catering options for a family gathering of around 25 people next weekend.',
    category: 'Food',
    area: 'Al Qua’a center',
    needed_by: '2026-07-04',
    urgency: 'this_week',
    status: 'open',
    created_by: '00000000-0000-0000-0000-000000000001',
  },
];

const interests = [
  {
    request_id: '10000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    note: 'Need delivery this week.',
  },
  {
    request_id: '10000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000002',
    note: 'Can join the same feed run.',
  },
  {
    request_id: '10000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000001',
    note: 'I have items to bring too.',
  },
  {
    request_id: '10000000-0000-0000-0000-000000000004',
    user_id: '00000000-0000-0000-0000-000000000002',
    note: 'Visitors asked about this.',
  },
];

async function upsertOrThrow(client, table, rows, options) {
  const { error } = await client.from(table).upsert(rows, options);
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
  console.log(`Seeded ${rows.length} ${table}`);
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  await upsertOrThrow(supabase, 'profiles', profiles, { onConflict: 'id' });
  await upsertOrThrow(supabase, 'requests', requests, { onConflict: 'id' });
  await upsertOrThrow(supabase, 'request_interests', interests, { onConflict: 'request_id,user_id' });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
