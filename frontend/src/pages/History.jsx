import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { err } from "../api";

export default function History() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [e, setE] = useState("");

  const load = () =>
    api
      .get("/history", { params: { q, type } })
      .then(r => setRows(r.data))
      .catch(x => setE(err(x)));

  useEffect(() => {
    load();
  }, [q, type]);

  const clear = async () => {
    if (confirm("Delete all history?")) {
      await api.delete("/history");
      load();
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Translation history</h1>

      <div className="history-toolbar">
        <input
          type="text"
          placeholder="Search translations…"
          value={q}
          onChange={x => setQ(x.target.value)}
          aria-label="Search translations"
        />
        <select
          value={type}
          onChange={x => setType(x.target.value)}
          aria-label="Filter by translation type"
        >
          <option value="">All translation types</option>
          <option value="text">Text</option>
          <option value="voice">Voice</option>
          <option value="vision">Vision</option>
          <option value="conversation">Conversation</option>
        </select>
        <button type="button" className="btn danger" onClick={clear}>
          Clear history
        </button>
      </div>

      {e && (
        <div className="error" role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{e}</span>
        </div>
      )}

      {rows.length === 0 && (
        <p className="empty-state">No translations yet. Try the Voice or Text tool.</p>
      )}

      {rows.map(r => (
        <div className="card history-card" key={r.id}>
          <div className="history-meta">
            <span className="history-badge">{r.translation_type}</span>
            <span>{r.source_language} → {r.target_language}</span>
            <span className="muted">{new Date(r.created_at + "Z").toLocaleString()}</span>
          </div>
          <div className="history-content">
            <div className="history-block">
              <span className="history-label">Original</span>
              <p className="history-text">{r.source_text}</p>
            </div>
            <div className="history-block">
              <span className="history-label">Translation</span>
              <p className="history-text translation-text"><b>{r.translated_text}</b></p>
            </div>
          </div>
          <div className="history-actions">
            <button
              type="button"
              className="btn ghost btn-sm"
              onClick={() => navigator.clipboard.writeText(r.translated_text)}
            >
              Copy
            </button>
            <button
              type="button"
              className="btn ghost btn-sm"
              onClick={async () => {
                await api.delete("/history/" + r.id);
                load();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
