import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMicrophone, FaStop } from "react-icons/fa";
import api, { err } from "../api";
import { toWav } from "../audio";
import Wave from "./Wave";
import LangPair, { Result } from "./Lang";

export default function Voice() {
  const [src, setSrc] = useState("en");
  const [tgt, setTgt] = useState("hi");
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const [blob, setBlob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [e, setE] = useState("");
  const [res, setRes] = useState(null);
  const [stream, setStream] = useState(null);
  const mr = useRef();
  const chunks = useRef([]);
  const timer = useRef();

  useEffect(() => () => clearInterval(timer.current), []);

  const start = async () => {
    setE("");
    setRes(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(s);
      chunks.current = [];
      m.ondataavailable = x => chunks.current.push(x.data);
      m.onstop = () => {
        setBlob(new Blob(chunks.current, { type: m.mimeType || "audio/webm" }));
        s.getTracks().forEach(t => t.stop());
      };
      m.start();
      setStream(s);
      mr.current = m;
      setRec(true);
      setSecs(0);
      timer.current = setInterval(() => setSecs(x => x + 1), 1000);
    } catch {
      setE("Microphone access was denied or is unavailable. Please allow microphone permissions in your browser.");
    }
  };

  const stop = () => {
    setStream(null);
    mr.current?.stop();
    clearInterval(timer.current);
    setRec(false);
  };

  const send = async () => {
    setBusy(true);
    setE("");
    const f = new FormData();
    try {
      f.append("audio", await toWav(blob), "rec.wav");
    } catch {
      f.append("audio", blob, "rec.webm");
    }
    f.append("source_language", src);
    f.append("target_language", tgt);
    try {
      setRes((await api.post("/speech", f)).data);
    } catch (x) {
      setE(err(x));
    }
    setBusy(false);
  };

  const formatTimer = s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="page-container">
      <Link to="/app" className="back-link" aria-label="Back to Dashboard">
        <span aria-hidden="true">←</span>
        <span>Back to Dashboard</span>
      </Link>
      <h1 className="page-title">Voice translation</h1>

      <div className="card">
        <LangPair {...{ src, tgt, setSrc, setTgt }} />

        <div className="row">
          {!rec ? (
            <button type="button" className="btn btn-record" onClick={start}>
              <FaMicrophone aria-hidden="true" />
              <span>Start recording</span>
            </button>
          ) : (
            <button type="button" className="btn danger btn-record" onClick={stop}>
              <span className="rec-dot" aria-hidden="true" />
              <FaStop aria-hidden="true" />
              <span>Stop ({formatTimer(secs)})</span>
            </button>
          )}
          <button
            type="button"
            className="btn"
            disabled={!blob || rec || busy}
            onClick={send}
          >
            {busy ? "Translating…" : "Translate"}
          </button>
        </div>

        <Wave stream={stream} />

        {blob && !rec && (
          <div className="audio-preview">
            <span className="audio-preview-label">Recorded audio preview</span>
            <audio controls src={URL.createObjectURL(blob)} aria-label="Recorded audio preview" />
          </div>
        )}

        {e && (
          <div className="error" role="alert">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <span>{e}</span>
          </div>
        )}
      </div>

      <Result r={res} onAgain={() => { setRes(null); setBlob(null); }} />
    </div>
  );
}
