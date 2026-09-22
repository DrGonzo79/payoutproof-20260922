# CEO review

Generated 2026-09-22 · **Mode: SCOPE REDUCTION** for the public prototype

## Nuclear scope challenge

The initial “Kelley Blue Book for crashed cars” framing overstates the product: a total-loss audit concerns the vehicle’s pre-loss actual cash value, not crash damage. Calling a $99 output “certified” before licensing and legal review is a trust failure. The direct outcome is narrower: help a claimant identify potentially weak valuation inputs and ask precise questions before accepting.

**Current state → this plan → 12-month ideal:** confusing PDF and ad hoc browsing → explainable demo/concierge audit → source-licensed, jurisdiction-aware evidence product with professional escalation and verified outcome data.

### Alternatives

1. **Manual audit memo (S/low):** fastest validation, highest learning, low scalability.
2. **Self-serve explainable screen (M/medium):** selected for this prototype; demonstrates trust loop without claiming live data.
3. **Regulated evidence network (XL/high):** ideal architecture after demand, data rights, and professional partnerships.

The prototype deliberately excludes upload, OCR, scraping, accounts, payment, and claim submission. Those features would imply trust that has not been earned.

## 1. Architecture review

The static UI and Python service are separated honestly. Shared fixture semantics reduce demo drift. Production must move authoritative calculation server-side, pin rule versions, and keep immutable evidence. A client-only production calculator would allow tampering and irreproducible disputes. Rollback is a previous Pages artifact plus rule-version deactivation.

## 2. Error and rescue map

- Range/type failures → Pydantic `422`; UI shows a specific validation message.
- Unknown comparable → domain `ValueError` → named `422` detail.
- Too few comps → domain `ValueError` → named `422`; UI blocks locally.
- Missing/malformed fixture → `RuntimeError` → `503`; never silently returns a zero value.
- Clipboard denial → visible inline fallback message.
- Slow calculation → disabled CTA and loading label; double-click cannot enqueue duplicate work.

Production still needs named errors for unsupported PDF, OCR timeout, VIN mismatch, stale/removed listing, feed rate limit, and report-generation failure.

## 3. Security and threat model

Demo collects nothing and uses no secrets. Production risk is high because valuation PDFs may contain names, addresses, VINs, policy and claim numbers. Required: malware scan, redaction, least-privilege object access, retention/deletion controls, encryption, audit log, authorization checks, CSRF protection, rate limits, and vendor data-processing agreements. Prompt injection is irrelevant unless an LLM later reads documents; extracted text must remain data, never instructions.

## 4. Data flow and interaction edge cases

Nil/empty/non-numeric/negative/oversized offer and mileage are rejected. Excluding too many comps is rejected. Editing an input or comp invalidates stale results. Median handles even and odd sets. Remaining gaps: duplicate listings across sources, condition mismatch, trim aliases, ZIP boundaries, currency/locale, removed listings, salvage history, and valuation dates older than the market evidence.

## 5. Code quality review

The domain operation is small, typed, and deterministic. The frontend intentionally mirrors the server for a static demo; production must replace this duplication with a generated contract/client. Fixture path and rule constants are explicit. Avoid a generic “AI valuation” abstraction; the rule vocabulary is the product.

## 6. Test review

Python tests cover health, fixture retrieval, happy path, evidence exclusion, invalid offer, unknown comp, and upstream fixture failure. Playwright covers empty state, validation, loading-to-result, comp exclusion, confidence downgrade, clipboard interaction, and mobile overflow. Build/typecheck validate export. Missing production tests: OCR corpus, rule-version golden files, provider contract tests, authorization, idempotency, concurrency, accessibility audit, and disaster restore.

## 7. Observability and monitoring

Demo CI is the monitor. Production needs: audit-start/completion/failure by stage, unsupported-doc rate, field-correction rate, provider latency/error rate, comp count/confidence distribution, report-generation failure, deletion SLA, refund rate, and verified valuation corrections. Alert on provider outage, >5% server errors, rule-version anomaly, and privacy deletion breach. Every failed audit needs a user-visible state and support correlation ID.

## 8. Database and state management

No demo database. Production uses append-only audit versions and unique `(provider, listing_id, captured_at)` evidence keys. Claims reference a vehicle snapshot, not mutable current vehicle data. Index owner/status/deadline and audit creation time. Separate outcome consent from product operation. Never overwrite the audit used for a prior report.

## 9. API design and contract

The demo API is explicit and validated. Production needs versioned `/v1/audits`, asynchronous status for OCR/provider work, idempotency keys, pagination for evidence, signed report links, structured error codes, and rate limits. Do not expose provider credentials or raw licensed payloads to browsers.

## 10. Performance and scalability

At 10×, OCR/provider latency dominates; queue and cache evidence by VIN taxonomy/region/date within license terms. At 100×, provider quotas, document storage, and report rendering dominate. CPU for median adjustment is trivial. Apply backpressure and show honest ETAs rather than timing out synchronously.

## 11. Design and UX

The hierarchy is claim → evidence → finding. Fictional state and legal boundary appear before interaction. Inputs have accessible labels/focus, errors are live, and mobile tables scroll within their card without causing page overflow. The confidence downgrade after excluding evidence makes uncertainty tangible. Production needs source links, per-adjustment explanations, document redaction preview, progress recovery, and WCAG testing.

## Decisions

- **Strongest challenges:** regulatory positioning, lawful/reliable evidence acquisition, and proving that audits change outcomes.
- **Recommended path:** pair this self-serve prototype with manual paid audits; validate before automating ingestion.
- **Accepted:** transparent screening calculation, evidence selection, confidence, next-step copy.
- **Deferred:** PDF/OCR, live feeds, payments, accounts, professional review, outcomes database.
- **Not in scope:** certified appraisal, legal advice, payout guarantee, autonomous insurer negotiation.
- **Status:** DONE_WITH_CONCERNS — product wedge is credible; market demand and data/legal feasibility remain unproven.
