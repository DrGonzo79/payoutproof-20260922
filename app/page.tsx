"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, FileSearch, Gauge, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import fixture from "../data/demo.json";

type Comparable = (typeof fixture.comparables)[number];
type Result = {
  marketValue: number;
  gap: number;
  gapPercent: number;
  confidence: "Strong" | "Directional";
  adjusted: Array<Comparable & { adjustedPrice: number }>;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function calculate(offer: number, mileage: number, excluded: string[]): Result {
  const included = fixture.comparables.filter((item) => !excluded.includes(item.id));
  const adjusted = included.map((item) => ({
    ...item,
    adjustedPrice: Math.round(
      item.price
      + (item.mileage - mileage) * fixture.adjustments.mileageDollarsPerMile
      + (fixture.vehicle.year - item.year) * fixture.adjustments.yearDollars
      + (fixture.adjustments.trim[item.trim as keyof typeof fixture.adjustments.trim] ?? 0)
    )
  }));
  const values = adjusted.map((item) => item.adjustedPrice).sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  const marketValue = values.length % 2 ? values[middle] : Math.round((values[middle - 1] + values[middle]) / 2);
  const gap = Math.round(marketValue - offer);
  return {
    marketValue,
    gap,
    gapPercent: Math.round((gap / offer) * 1000) / 10,
    confidence: adjusted.length >= 4 ? "Strong" : "Directional",
    adjusted
  };
}

export default function Home() {
  const [offer, setOffer] = useState(String(fixture.insurerOffer));
  const [mileage, setMileage] = useState(String(fixture.vehicle.mileage));
  const [excluded, setExcluded] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const parsedOffer = Number(offer);
  const parsedMileage = Number(mileage);
  const includedCount = fixture.comparables.length - excluded.length;
  const vehicleLabel = `${fixture.vehicle.year} ${fixture.vehicle.make} ${fixture.vehicle.model} ${fixture.vehicle.trim}`;
  const excludedLabel = useMemo(() => excluded.length ? `${excluded.length} excluded` : "All included", [excluded]);

  function runAudit() {
    if (!Number.isFinite(parsedOffer) || parsedOffer < 1000 || parsedOffer > 250000) {
      setError("Enter an insurer offer between $1,000 and $250,000.");
      setResult(null);
      return;
    }
    if (!Number.isInteger(parsedMileage) || parsedMileage < 0 || parsedMileage > 500000) {
      setError("Enter whole-number mileage between 0 and 500,000.");
      setResult(null);
      return;
    }
    if (includedCount < 2) {
      setError("Keep at least two comparable vehicles in the audit.");
      setResult(null);
      return;
    }
    setError("");
    setBusy(true);
    setCopied(false);
    window.setTimeout(() => {
      setResult(calculate(parsedOffer, parsedMileage, excluded));
      setBusy(false);
    }, 550);
  }

  function toggleComparable(id: string) {
    setExcluded((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setResult(null);
    setCopied(false);
  }

  function reset() {
    setOffer(String(fixture.insurerOffer));
    setMileage(String(fixture.vehicle.mileage));
    setExcluded([]);
    setResult(null);
    setError("");
    setCopied(false);
  }

  async function copyNote() {
    if (!result) return;
    const note = `Please explain the valuation for my ${vehicleLabel}. PayoutProof's fictional demo audit estimates ${money.format(result.marketValue)}, a ${money.format(result.gap)} difference from the ${money.format(parsedOffer)} offer. Please identify each comparable and adjustment used.`;
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
    } catch {
      setError("Clipboard access was blocked. Copy the figures from the summary instead.");
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="PayoutProof home">
          <span className="brandmark"><ShieldCheck size={20} /></span>
          <span>PayoutProof</span>
        </a>
        <span className="demo-pill">Interactive concept demo</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">TOTAL-LOSS VALUATION AUDIT</p>
          <h1>Know the gap before you accept the check.</h1>
          <p className="lede">Compare an insurer offer with mileage-, year-, and trim-adjusted listings. Every number stays inspectable.</p>
        </div>
        <div className="promise">
          <Gauge size={22} />
          <div><strong>5-minute first pass</strong><span>Demo data, transparent math, no black box.</span></div>
        </div>
      </section>

      <div className="notice" role="note">
        <TriangleAlert size={17} />
        <span><strong>Fictional demonstration.</strong> This is not an appraisal, legal advice, or an insurer-ready report. No live marketplace data or AI is used.</span>
      </div>

      <section id="workspace" className="workspace" aria-label="Valuation audit workspace">
        <aside className="claim-card">
          <div className="section-heading">
            <div><p className="step">01 · CLAIM</p><h2>Offer details</h2></div>
            <button className="icon-button" onClick={reset} aria-label="Reset demo"><RotateCcw size={17} /></button>
          </div>
          <div className="vehicle">
            <div className="vehicle-icon">TH</div>
            <div><strong>{vehicleLabel}</strong><span>Demo claim · ZIP {fixture.vehicle.zip}</span></div>
          </div>
          <label>
            Insurer offer
            <span className="input-wrap"><span>$</span><input aria-label="Insurer offer" inputMode="numeric" value={offer} onChange={(event) => { setOffer(event.target.value); setResult(null); }} /></span>
          </label>
          <label>
            Vehicle mileage
            <span className="input-wrap"><input aria-label="Vehicle mileage" inputMode="numeric" value={mileage} onChange={(event) => { setMileage(event.target.value); setResult(null); }} /><span>mi</span></span>
          </label>
          <button className="primary" onClick={runAudit} disabled={busy}>
            <FileSearch size={18} /> {busy ? "Auditing comparables…" : "Audit this offer"}
          </button>
          {error && <p className="error" role="alert">{error}</p>}
          <p className="privacy">Nothing is uploaded or saved in this static demo.</p>
        </aside>

        <div className="comps-card">
          <div className="section-heading">
            <div><p className="step">02 · EVIDENCE</p><h2>Comparable vehicles</h2></div>
            <span className="status">{excludedLabel}</span>
          </div>
          <p className="helper">Uncheck a weak match, then rerun the audit. At least two are required.</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th scope="col">Use</th><th scope="col">Comparable</th><th scope="col">Mileage</th><th scope="col">Distance</th><th scope="col">List price</th></tr></thead>
              <tbody>
                {fixture.comparables.map((item) => {
                  const included = !excluded.includes(item.id);
                  return (
                    <tr key={item.id} className={included ? "" : "excluded"}>
                      <td><input type="checkbox" aria-label={`Include ${item.id}`} checked={included} onChange={() => toggleComparable(item.id)} /></td>
                      <td><strong>{item.year} {fixture.vehicle.make} {fixture.vehicle.model}</strong><span>{item.trim} · {item.source}</span></td>
                      <td>{item.mileage.toLocaleString()}</td><td>{item.distanceMiles} mi</td><td>{money.format(item.price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={`result-card ${result ? "ready" : ""}`} aria-live="polite">
        {!result ? (
          <div className="empty"><FileSearch size={28} /><div><strong>Your audit summary will appear here.</strong><span>Run the demo to see the estimate, evidence adjustments, and negotiation prompt.</span></div></div>
        ) : (
          <>
            <div className="result-heading">
              <div><p className="step">03 · FINDING</p><h2>Offer may be {money.format(result.gap)} below the demo market estimate</h2></div>
              <span className={`confidence ${result.confidence.toLowerCase()}`}>{result.confidence} evidence</span>
            </div>
            <div className="metrics">
              <div><span>Insurer offer</span><strong>{money.format(parsedOffer)}</strong></div>
              <div><span>Adjusted median</span><strong>{money.format(result.marketValue)}</strong></div>
              <div className="gap"><span>Potential gap</span><strong>{money.format(result.gap)} <small>({result.gapPercent}%)</small></strong></div>
            </div>
            <div className="adjustments">
              {result.adjusted.map((item) => <div key={item.id}><span>{item.id}</span><strong>{money.format(item.adjustedPrice)}</strong></div>)}
            </div>
            <div className="next-step">
              <div><Check size={19} /><p><strong>Recommended next step</strong><span>Ask the adjuster to identify every comparable and explain each mileage, year, trim, and condition adjustment in writing.</span></p></div>
              <button className="secondary" onClick={copyNote}><Clipboard size={17} />{copied ? "Copied" : "Copy request"}</button>
            </div>
          </>
        )}
      </section>

      <footer>
        <span>PayoutProof · Prototype, September 2026</span>
        <a href="https://www.ideabrowser.com/hub/ideas/total-loss-payout-checker-for-totaled-cars">Source idea ↗</a>
      </footer>
    </main>
  );
}
