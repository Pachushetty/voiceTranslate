import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { toWav } from "../audio";
import Wave from "./Wave";
import api, { err, LANGS, audioSrc } from "../api";

function Side({ name, lang, setLang, active, busy, onStart, onStop, rec }) {
  return (
    <div className="conversation-panel">
      <h3>{name}</h3>
      <label className="form-label">
        <span>Language</span>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          disabled={rec || busy}
        >
          {Object.entries(LANGS).map(([k, n]) => (
            <option key={k} value={k}>{n}</option>
          ))}
        </select>
      </label>
      <div className="row">
        {!rec ? (
          <button
            type="button"
            className="btn"
            disabled={busy || active}
            onClick={onStart}
          >
            <FaMicrophone aria-hidden="true" />
            <span>Record</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn danger"
            onClick={onStop}
          >
            <span className="rec-dot" aria-hidden="true" />
            <FaStop aria-hidden="true" />
            <span>Stop</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function Conversation() {
  const [lang, setLang] = useState({ A: "en", B: "hi" });
  const [rec, setRec] = useState(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [e, setE] = useState("");
  const [stream, setStream] = useState(null);
  const mr = useRef();
  const chunks = useRef([]);

  const start = async who => {
    setE("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(s);
      chunks.current = [];
      m.ondataavailable = x => chunks.current.push(x.data);
      m.onstop = async () => {
        s.getTracks().forEach(t => t.stop());
        setBusy(true);
        const f = new FormData();
        const raw = new Blob(chunks.current, { type: m.mimeType || "audio/webm" });
        try {
          f.append("audio", await toWav(raw), "r.wav");
        } catch {
          f.append("audio", raw, "r.webm");
        }
        const other = who === "A" ? "B" : "A";
        f.append("source_language", lang[who]);
        f.append("target_language", lang[other]);
        f.append("kind", "conversation");
        try {
          const r = (await api.post("/speech", f)).data;
          setLog(l => [...l, { who, ...r }]);
        } catch (x) {
          setE(err(x));
        }
        setBusy(false);
      };
      m.start();
      setStream(s);
      mr.current = m;
      setRec(who);
    } catch {
      setE("Microphone access was denied or is unavailable. Please allow microphone permissions in your browser.");
    }
  };

  const stop = () => {
    setStream(null);
    mr.current?.stop();
    setRec(null);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Two-way conversation</h1>
      <p className="muted">
        Take turns: one person records, then the translation is shown and played for the other. This is turn-based, not live streaming.
      </p>

      <div className="conversation-grid">
        {["A", "B"].map(w => (
          <Side
            key={w}
            name={"Person " + w}
            lang={lang[w]}
            setLang={v => setLang({ ...lang, [w]: v })}
            rec={rec === w}
            active={rec && rec !== w}
            busy={busy}
            onStart={() => start(w)}
            onStop={stop}
          />
        ))}
      </div>

      <Wave stream={stream} />

      {busy && <p className="muted">Translating audio, please wait…</p>}
      {e && (
        <div className="error" role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{e}</span>
        </div>
      )}

      <div className="transcript-header">
        <h2 className="section-title">Transcript</h2>
        <button
          type="button"
          className="btn ghost btn-sm"
          onClick={() => setLog([])}
          disabled={!log.length}
        >
          Clear conversation
        </button>
      </div>

      {!log.length && (
        <p className="empty-state">No messages yet. Person A can record first.</p>
      )}

      {log.map((m, i) => (
        <div key={i} className={"bubble bubble-" + m.who}>
          <div className="bubble-header">
            <span className="speaker-tag">Person {m.who}</span>
            <span className="muted">{LANGS[lang[m.who]]}</span>
          </div>
          <p className="bubble-orig">{m.original_text}</p>
          <p className="bubble-trans"><b>{m.translated_text}</b></p>
          {m.audio_url && (
            <audio controls src={audioSrc(m.audio_url)} aria-label={`Spoken translation for Person ${m.who}`} />
          )}
        </div>
      ))}
    </div>
  );
}
