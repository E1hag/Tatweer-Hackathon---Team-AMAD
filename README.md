# Mawjood

Mawjood is a demand-first request and fulfillment app for Al Qua'a. Residents post practical local needs, other residents add visible demand with "Me Too", and local businesses respond with fulfillment offers once there is evidence of real customers.

## Tatweer Hackathon Submission

**Challenge chosen:** Challenge 3 - The data gap for local entrepreneurs

**Specific problem:** Local entrepreneurs and small businesses in Al Qua'a often have to guess what residents need, whether enough people want it, and whether it is worth spending time or money to offer a service. This makes it harder to start small rural businesses, test ideas, or serve dispersed residents efficiently.

**Target demographic:**

- Residents in and around Al Qua'a who need services, deliveries, repairs, food options, farm support, or shared trips.
- Local businesses and aspiring entrepreneurs who need evidence of demand before creating an offer.

**Core idea:** Mawjood turns scattered local needs into visible demand signals. Instead of starting with a marketplace full of guesses, it starts with resident requests. Businesses can then see what people actually need and create offers for requests that already have demand.

## Why It Fits Challenge 3

Challenge 3 asks for digital tools that help local entrepreneurs gather, access, or make sense of community data so they can decide with evidence instead of guesswork. Mawjood does this by collecting:

- request titles and categories,
- resident interest counts,
- areas,
- urgency,
- needed-by dates,
- fulfillment offers,
- joined resident counts,
- completion and confirmation status.

For a local entrepreneur, this becomes lightweight market research: "What do people nearby need, how many need it, and what can I offer first?"

## Solution Overview

### Resident Side

Residents can:

- sign up or log in,
- browse local requests,
- search requests,
- create a new request,
- tap "Me Too" to show they also need something,
- see available business offers for a request,
- see whether they are included in matching offers,
- view their joined requests and fulfillment confirmations.

### Business Side

Business users can:

- sign up or log in as a business,
- see a business home dashboard,
- browse resident requests under the `Requests` tab,
- filter requests by status,
- inspect request demand details,
- create fulfillment offers,
- manage offers under the `Offers` tab,
- see joined residents for their offers,
- mark offers completed or cancelled when allowed.

## Current MVP Loop

1. A resident posts a request, such as "Shared pickup from Al Ain" or "Camel feed bags".
2. Other residents tap "Me Too" and add details like quantity, date, and note.
3. The request becomes visible to businesses with demand count, area, urgency, and status.
4. A business creates a fulfillment offer for that request.
5. Residents connected to the request are included in the matching offer flow.
6. The business sees joined residents and marks the offer completed.
7. Residents can confirm whether fulfillment happened.

This demonstrates the core claim: a business can make a decision from visible local demand instead of guessing.

## Impact and Community Value

Mawjood is built for a dispersed rural community where demand is real but often invisible. The expected value is:

- Residents can express needs without knowing which business can help yet.
- Businesses can avoid launching offers with no evidence of customers.
- Aspiring entrepreneurs can spot repeated unmet needs.
- Shared demand can make small routes, deliveries, and services more viable.
- The community gets a single feedback loop between need and fulfillment.

## Testable Claims

These claims can be tested in the current prototype:

1. A resident can create a request and increase demand by joining it with "Me Too".
2. A business can see resident requests and create an offer for a selected request.
3. A business can see joined residents for its offers.
4. A resident can see availability details for offers attached to a request.
5. A business can complete or cancel offers depending on offer status.
6. Resident and business profiles route to different app experiences.

## Evidence and Validation

The repository includes early evidence notes in:

- `evidence/local-context.md`
- `evidence/assumptions.md`
- `evidence/demo-scenarios.md`
- `evidence/survey-questions.md`

During development, the app was verified with:

- TypeScript checks: `npx tsc --noEmit`
- Expo lint: `npm run lint`
- Expo web export: `npx expo export --platform web --output-dir /private/tmp/mawjood-export`
- Supabase smoke checks for request creation, interest, offer creation, joined residents, completion, and resident confirmation.

## Feasibility

Mawjood is feasible because it uses standard mobile/web tooling and a simple backend model:

- Expo React Native for iOS, Android, and web.
- Supabase Auth for user identity.
- Supabase Postgres tables for profiles, requests, interests, offers, and joiners.
- Role-based navigation for residents and businesses.
- No expensive hardware, maps, payments, delivery fleet, or complex AI dependency is required for the MVP.

The MVP can be piloted with a small number of residents and businesses in Al Qua'a. It only needs smartphones, a Supabase project, and a basic community onboarding process.

## Scalability

The model can scale beyond the hackathon in stages:

1. **Al Qua'a pilot:** Use seeded categories and local business onboarding.
2. **More villages/areas:** Add area filters and community-specific categories.
3. **More business types:** Add repeat offer templates for farms, delivery, food, repairs, tourism, and services.
4. **Better demand intelligence:** Summaries of repeated requests by category, area, and urgency.
5. **Operational tools:** Notifications, scheduling, and business analytics after the core loop is proven.

The data model is intentionally simple, so it can be replicated for other rural communities.

## Readiness

The current build is a working prototype, not only a mockup. It includes:

- authentication,
- resident screens,
- business screens,
- role-based navigation,
- request creation,
- request interest,
- offer creation,
- offer management,
- joined resident display,
- fulfillment confirmation flow,
- Supabase integration.

Known limitations:

- Demo data should be cleaned before presentation.
- The resident currently joins a request through "Me Too"; there is not a separate "choose one exact offer" flow.
- Scheduling is a text field for hackathon speed.
- Production deployment and app-store release are out of scope for the weekend prototype.

## Demo Script

Use this flow for judging:

1. Log in or sign up as a resident.
2. Create or open a request.
3. Tap "Me Too" to show shared demand.
4. View availability for the request.
5. Log in as a business profile.
6. Open `Requests`.
7. Select the resident request and inspect demand details.
8. Create a fulfillment offer.
9. Open `Offers`.
10. Show joined residents and mark an offer complete.
11. Return to the resident side and show confirmation/order status.

## Tech Stack

- Expo SDK 56
- React Native
- TypeScript
- React Navigation
- Supabase JavaScript client
- Supabase Auth
- Supabase Postgres
- AsyncStorage for local Supabase auth persistence
- `react-native-url-polyfill` for URL support in React Native

## Database Shape

Current public Supabase tables:

- `profiles`
- `requests`
- `request_interests`
- `fulfillment_offers`
- `offer_joiners`

Supporting database objects used by the app include request summary and fulfillment-related RPCs, such as:

- `request_summary`
- `set_request_interest`
- `remove_request_interest`
- `my_request_interests`
- `my_pending_confirmations`
- `confirm_fulfillment`

Request urgency values:

- `today`
- `this_week`
- `flexible`

Request status values:

- `open`
- `demand_growing`
- `offered`
- `scheduled`
- `fulfilled`
- `unfulfilled`

Offer status values:

- `proposed`
- `accepting`
- `completed`
- `cancelled`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Add Supabase public client values:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_ANON_KEY=
   ```

4. Start Expo:

   ```bash
   npx expo start
   ```

5. Run on iOS simulator:

   ```bash
   npx expo start --ios
   ```

6. Run on web:

   ```bash
   npx expo start --web
   ```

## Verification Commands

Run these before judging or merging:

```bash
npm run lint
npx tsc --noEmit
npx expo export --platform web --output-dir /private/tmp/mawjood-export
```

## Environment Variables

Expo exposes public client variables with the `EXPO_PUBLIC_` prefix. Do not store private service-role keys or other secrets in these values.

Required:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Folder Structure

```text
src/
  components/
    common/
    icons/
  constants/
  context/
  data/
  hooks/
  lib/
  navigation/
  screens/
  services/
  types/
  utils/
evidence/
```

## Judging Criteria Mapping

| Criterion | How Mawjood addresses it |
|---|---|
| Impact and value | Helps residents express needs and helps local businesses respond to real demand. |
| Relevance to challenge | Directly addresses Challenge 3 by turning local demand into usable data for entrepreneurs. |
| Feasibility | Uses Expo and Supabase, requires no special hardware, and can be piloted with a small local group. |
| Readiness | Working prototype with resident and business flows, authentication, Supabase data, and offer management. |
| Scalability | Can replicate to other rural areas by adding areas, categories, and business onboarding. |
| Falsifiability and evidence | Includes testable claims, evidence notes, demo scenarios, and verified app/backend checks. |
| Repo documentation | README explains the problem, target users, solution, setup, verification, evidence, and limitations. |
| Presentation/live demo | Demo script shows the end-to-end resident-to-business loop. |

## Git Workflow

- Keep the repository public for judging.
- Keep `.env` local and use `.env.example` for shared variable names.
- Commit only code and docs needed to understand, run, and verify the submission.

## License

This hackathon prototype is submitted for Tatweer Hackathon judging. See `LICENSE` for repository license details.
