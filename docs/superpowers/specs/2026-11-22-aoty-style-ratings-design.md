# AOTY-Style Ratings Design

## Intent

Let signed-in users rate a novel quickly, while making dimensional scores and
written reviews optional.

## Approved product decisions

- Keep the existing `Review` model and one-entry-per-user-per-novel rule.
- `scoreOverall` is required and ranges from 0–100.
- `scoreStory`, `scoreCharacters`, and `scoreWorldBuilding` are optional and
  range from 1–10 when provided.
- Translation scoring is removed from the user-facing rating form and score
  model behavior.
- `body` is optional and has no character limit.
- Spoiler marking remains available only when a body is provided.
- Any authenticated, non-banned user can submit immediately; remove the
  seven-day account-age restriction.
- Existing overall scores migrate from 1–10 to 10–100 by multiplying by ten.
- Existing dimensional scores remain on the 1–10 scale.

## User experience

The novel page shows a rating form for authenticated users:

```text
Overall  [0–100]       required
Story    [optional /10]
Characters [optional /10]
Worldbuilding [optional /10]
Review   [optional, unlimited]
Spoilers [available when review text exists]
```

Submitting only the overall score is valid. The existing review list,
helpful-vote, moderation, spoiler masking, and score recalculation flows remain
in place.

## Data and behavior changes

- Make `Review.body`, `scoreStory`, `scoreCharacters`, and `scoreWorldBuilding`
  nullable in Prisma.
- Change `scoreOverall` to accept 0–100.
- Remove `scoreTranslation` from active scoring and the form; preserve the
  database field temporarily for safe migration compatibility.
- Update weighted score calculations so optional dimensions average only
  submitted values, while overall ratings count every entry.
- Remove the account-age check from review submission.
- Remove the 150-character minimum and 10,000-character maximum.
- Sanitize non-empty review bodies; store an empty/missing body as `null`.
- Keep the existing unique constraint, rate limiting, status, moderation, and
  background recalculation behavior.

## Verification

Add tests for:

- overall ratings from 0 through 100;
- optional dimensions and optional empty body;
- rejection of out-of-range scores;
- immediate eligibility for a newly created authenticated account;
- score aggregation that excludes missing dimensions.
