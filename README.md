# PayoutProof

An interactive concept for auditing a totaled-car insurer offer against transparent, normalized comparable listings. The shipped demo uses fictional data and a deterministic rules engine. It is **not** an appraisal, legal advice, or a guarantee of a revised payout.

## What works

- Edit insurer offer and mileage with visible range validation.
- Include/exclude fictional comparable vehicles.
- Calculate mileage/year/trim-adjusted values and a median gap.
- Downgrade evidence confidence as the comparable set narrows.
- Copy a concrete request for an adjuster.
- Run the equivalent validated FastAPI domain operation locally.

GitHub Pages serves only the static Next.js frontend. The Python backend is tested, runnable source and is not deployed.

## Run frontend

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Run backend

```bash
cd api
uv sync --frozen
uv run uvicorn main:app --reload
```

Open http://localhost:8000/docs.

## Verify

```bash
npm run typecheck
npm run test:e2e
npm run build
npm run audit:prod
cd api && uv sync --frozen && uv run pytest
```

## Docs

- [Product plan](docs/PRODUCT.md)
- [Office Hours diagnostic](docs/OFFICE_HOURS.md)
- [CEO review](docs/CEO_REVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Build prompts](docs/BUILD_PROMPTS.md)
- [Source notes](research/notes.md)

Source inspiration: [Ideabrowser — Total Loss Payout Checker for Totaled Cars](https://www.ideabrowser.com/hub/ideas/total-loss-payout-checker-for-totaled-cars).

## License

Prototype source provided for evaluation. Third-party marketplace names and data are not bundled; all displayed listings are fictional.
