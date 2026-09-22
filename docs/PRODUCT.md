# Product plan

## Positioning

PayoutProof is an explainable screening tool for people deciding whether to challenge a totaled-car insurance valuation. It turns a confusing offer into an auditable comparison and a concrete written question. It does not replace an appraiser, attorney, or insurer decision.

## ICP and JTBD

- **Initial ICP:** U.S. consumer with a 3–8-year-old mainstream vehicle, an insurer total-loss offer, and a decision deadline within 10 days.
- **Buyer context:** potential gap above $1,000; replacement transportation is urgent; claimant is comfortable paying $29–$99 to avoid a larger loss.
- **JTBD:** “When my vehicle is totaled, help me quickly see whether the valuation inputs look fair and prepare a credible challenge before I accept.”
- **Avoid first:** exotic/classic vehicles, commercial fleets, salvage-title valuation, injury claims, legal representation, and automated claim submission.

## MVP vertical slice

1. Enter offer and mileage against an explicit demo vehicle.
2. Inspect four fictional comparable listings.
3. Include/exclude evidence and rerun validation.
4. Calculate transparent year, mileage, and trim adjustments using a median.
5. Show gap, confidence downgrade, and a copyable clarification request.

The Python API implements the same real domain operation and fixture contract. GitHub Pages hosts the static frontend only; the API remains local source.

## Data model

| Entity | Key fields | Notes |
|---|---|---|
| Claim | vehicle, ZIP, offer, received date, deadline | PII minimized; no policy number required |
| Vehicle | VIN-derived year/make/model/trim, mileage, condition | VIN decoding needs an authoritative provider |
| Comparable | source, listing ID, captured-at, location, price, mileage, trim | Evidence snapshot and license terms required |
| Adjustment | dimension, rule version, amount, rationale | Must be explainable and reproducible |
| Audit | included comps, median value, gap, confidence, disclaimer | Immutable version for dispute traceability |
| Outcome | response date, revised offer, delta, escalation | Opt-in and separated from marketing consent |

## Technical architecture

- **Web:** Next.js App Router + TypeScript; static export uses repository base path.
- **Domain API:** FastAPI + Pydantic; validated request, fixture loader, explainable adjustment engine, named 422/503 failures.
- **Fixtures:** one versioned JSON file shared by frontend and backend tests.
- **Production evolution:** object storage for redacted documents, Postgres for claims/audits, queue for extraction, append-only evidence snapshots, per-rule versioning.
- **Boundary:** browser math is demo-only. Production audits must be generated server-side from a signed rule version.

## AI/model strategy

No model is needed for valuation math. In a later phase, use document OCR/schema extraction to suggest fields, never to invent missing values; show source-page citations and require user confirmation. A rules engine performs adjustments. Consider an LLM only for rewriting the user’s evidence into plain-language correspondence, with deterministic templates as fallback. Track extraction field accuracy, correction rate, and unsupported-document rate.

## Economics

- **Wedge price hypothesis:** $29 self-serve audit or $79–$99 human-reviewed report.
- **Value anchor:** a plausible four-figure disputed gap; never promise recovery.
- **Target variable cost:** under $5 self-serve (data, OCR, support reserve), under $25 reviewed.
- **Target contribution margin:** >80% self-serve, >65% reviewed.
- **Acquisition constraint:** paid search can erase margin. Prefer collision shops, tow/storage operators, consumer advocates, and appraisers with transparent referral disclosure.
- **Kill threshold:** stop paid acquisition if verified contribution after refunds and support is negative across 30 orders.

## Validation plan

1. **Problem interviews (week 1):** 10 recent claimants; obtain 5 redacted reports.
2. **Concierge pilots (weeks 2–3):** sell 10 audits before automating; measure completion time and willingness to pay.
3. **Outcome test (weeks 3–6):** track adjuster response, revised valuation, time saved, refund reasons, and disputes caused by bad evidence.
4. **Channel test:** one collision-repair partner and one search landing page; compare qualified-audit CAC.

Success gates: ≥30% of qualified visitors start an audit, ≥40% finish, ≥15% pay after seeing a preliminary gap, ≥20% of submitted challenges produce a documented correction or valuation explanation, and <5% refund due to evidence quality. All are hypotheses.

## Moat

Not the calculator. Potential moat is a legally and commercially usable evidence pipeline: normalized vehicle taxonomy, source-permitted historical snapshots, adjustment-rule versions, insurer-specific issue patterns, and opt-in outcome data linking evidence to corrected offers. Trust, provenance, and distribution partnerships matter more than model novelty.

## Risks and mitigations

- **Unauthorized listing use:** license feeds or link users to source; do not scrape against terms.
- **Unlicensed appraisal/legal practice:** market as screening; obtain state-by-state counsel before reviewed/certified claims.
- **Bad extraction or mismatched trim:** source citations, user confirmation, confidence downgrade, professional escalation.
- **Selection bias in asking prices:** distinguish list from transaction prices and disclose limitations.
- **Sensitive documents:** redact by default, short retention, encryption, deletion controls, no policy/member IDs in analytics.
- **Adversarial incentives:** never fabricate comps or guarantee payouts; audit corrections and partner referrals.

## 30/60/90 days

- **0–30:** 10 interviews, 10 paid concierge audits, rubric and claim-disclaimer review, two partner conversations.
- **31–60:** consented PDF field extraction, licensed/approved comp source pilot, audit versioning, 30 more transactions, outcome follow-up.
- **61–90:** one-state reviewed report pilot with qualified appraiser/counsel, partner channel experiment, pricing test, go/no-go based on contribution and correction outcomes.
