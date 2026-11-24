import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { err, LANGS } from "../api";

export default function Settings() {
  const nav = useNavigate();
  const [s, setS] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/settings").then(r => setS(r.data));
  }, []);

  const save = async v => {
    setS({ ...s, preferred_language: v });
    try {
      await api.put("/settings", { preferred_language: v });
      setMsg("Settings saved successfully.");
    } catch (x) {
      setMsg(err(x));
    }
  };

  const out = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("vt_token");
    nav("/");
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>

      <div className="card settings-card">
        <div className="settings-section">
          <h2 className="section-title">User account</h2>
          <div className="settings-field">
            <span className="settings-field-label">Full name</span>
            <span className="settings-field-value">{s.full_name || "—"}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field-label">Username</span>
            <span className="settings-field-value">{s.username || "—"}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field-label">Email</span>
            <span className="settings-field-value">{s.email || "—"}</span>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Preferences</h2>
          <label className="form-label">
            <span>Preferred language</span>
            <select
              value={s.preferred_language || "en"}
              onChange={x => save(x.target.value)}
            >
              {Object.entries(LANGS).map(([k, n]) => (
                <option key={k} value={k}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Session</h2>
          <button type="button" className="btn danger" onClick={out}>
            Log out
          </button>
        </div>

        {msg && (
          <div className="status-success" role="status">
            <span>✓</span> {msg}
          </div>
        )}

        <p className="muted small-text">{s.app || "VoiceTranslate"}</p>
      </div>
    </div>
  );
}
