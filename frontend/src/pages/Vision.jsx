import { useState } from "react";
import { Link } from "react-router-dom";
import api, { err } from "../api";
import LangPair, { Result } from "./Lang";

const OKT = ["image/jpeg", "image/png", "image/webp"];

export default function Vision() {
  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("hi");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [e, setE] = useState("");
  const [res, setRes] = useState(null);
  const [drag, setDrag] = useState(false);
  const [ext, setExt] = useState("");

  const pick = f => {
    setRes(null);
    setE("");
    if (!f) return;
    if (!OKT.includes(f.type)) return setE("Please use a valid JPEG, PNG, or WebP image.");
    if (f.size > 10 * 1024 * 1024) return setE("Image size must be 10 MB or smaller.");
    setFile(f);
    setExt("");
  };

  const extract = async () => {
    setBusy(true);
    setE("");
    setRes(null);
    const f = new FormData();
    f.append("image", file);
    try {
      setExt((await api.post("/vision/extract", f)).data.extracted_text);
    } catch (x) {
      setE(err(x));
    }
    setBusy(false);
  };

  const go = async () => {
    setBusy(true);
    setE("");
    try {
      setRes((await api.post("/translation", { text: ext, source_language: src, target_language: tgt, translation_type: "vision" })).data);
    } catch (x) {
      setE(err(x));
    }
    setBusy(false);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">AI vision translator</h1>

      <div className="card">
        <LangPair {...{ src, tgt, setSrc, setTgt }} />

        <label
          className={"drop" + (drag ? " over" : "")}
          onDragOver={x => { x.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={x => { x.preventDefault(); setDrag(false); pick(x.dataTransfer.files[0]); }}
        >
          {file ? (
            <img src={URL.createObjectURL(file)} alt="Selected upload for translation" />
          ) : (
            <>
              <p>Drop an image here or click to choose</p>
              <small className="muted">JPEG, PNG, or WebP up to 10 MB</small>
            </>
          )}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            hidden
            onChange={x => pick(x.target.files[0])}
          />
        </label>

        <div className="row">
          <button
            type="button"
            className="btn"
            disabled={!file || busy}
            onClick={extract}
          >
            {busy && !ext ? "Reading image…" : "Extract text"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={!ext.trim() || busy}
            onClick={go}
          >
            Translate
          </button>
        </div>

        {ext && (
          <label className="form-label">
            <span>Extracted text (editable before translating)</span>
            <textarea
              rows="5"
              value={ext}
              onChange={x => setExt(x.target.value)}
            />
          </label>
        )}

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
