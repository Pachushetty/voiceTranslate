import { useState } from "react";
import { Link } from "react-router-dom";
import api, { err } from "../api";
import LangPair, { Result } from "./Lang";

export default function Text() {
  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("hi");
  const [t, setT] = useState("");
  const [busy, setBusy] = useState(false);
  const [e, setE] = useState("");
  const [res, setRes] = useState(null);

  const go = async () => {
    setBusy(true);
    setE("");
    try {
      setRes((await api.post("/translation", { text: t, source_language: src, target_language: tgt })).data);
    } catch (x) {
      setE(err(x));
    }
    setBusy(false);
  };

  return (
    <div className="page-container">
      <Link to="/app" className="back-link" aria-label="Back to Dashboard">
        <span aria-hidden="true">←</span>
        <span>Back to Dashboard</span>
      </Link>
      <h1 className="page-title">Text translation</h1>

      <div className="card">
        <LangPair {...{ src, tgt, setSrc, setTgt }} />

        <label className="form-label">
          <span>Input text</span>
          <textarea
            rows="6"
            maxLength="5000"
            value={t}
            onChange={x => setT(x.target.value)}
            placeholder="Type or paste text to translate…"
          />
        </label>
        <div className="char-counter">{t.length} / 5000 characters</div>

        <div className="row">
          <button
            type="button"
            className="btn"
            disabled={!t.trim() || busy}
            onClick={go}
          >
            {busy ? "Translating…" : "Translate"}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => { setT(""); setRes(null); }}
          >
            Clear
          </button>
        </div>

        {e && (
          <div className="error" role="alert">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <span>{e}</span>
          </div>
        )}
      </div>

      <Result r={res} />
    </div>
  );
}
