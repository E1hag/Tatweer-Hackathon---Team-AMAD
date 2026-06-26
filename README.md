# Qua’a Loop

Demand-first rural request board for Al Qua’a: residents post real needs, neighbors show shared demand, and businesses can fulfill requests once first customers are visible.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment placeholders:

   ```bash
   cp .env.example .env
   ```

3. Add Supabase values when backend work begins:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_ANON_KEY=
   ```

4. Start Expo:

   ```bash
   npx expo start
   ```

## Dependencies

- Expo SDK 56
- React Native
- Supabase JavaScript client
- AsyncStorage for local Supabase auth persistence
- react-native-url-polyfill for URL support in React Native

## Environment Variables

Expo exposes public client variables with the `EXPO_PUBLIC_` prefix. Do not store private service-role keys or other secrets in these values.

Required later for Supabase integration:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

The placeholder app warns when these are missing but does not crash.

## Folder Structure

```text
src/
  components/
    common/
  screens/
  navigation/
  lib/
  constants/
  data/
  hooks/
  services/
  utils/
evidence/
```

## Suggested Work Split

- Person A: Request board and "I need this too"
- Person B: Business offers and fulfillment flow
- Person C: Profile screen and demo role switching
- Person D: README, evidence folder, validation survey, screenshots

## Git Workflow

- Create a focused branch for each teammate task.
- Pull from the main branch before starting work each day.
- Keep pull requests small and tied to one feature area.
- Avoid mixing app logic, docs, and design rewrites in the same PR unless the task requires it.
- Use `.env.example` for shared variable names and keep `.env` local.

## Current MVP Loop

1. Resident posts a request.
2. Other residents tap "I need this too."
3. Demand count becomes visible.
4. Business or aspiring business creates an offer.
5. Resident can see fulfillment options.

## Deployment

Deployment is intentionally postponed until the end of the hackathon. The current milestone is a clean local development setup with fallback demo data.
