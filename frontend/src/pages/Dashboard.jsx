import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaMicrophone, FaFont, FaImage, FaComments } from "react-icons/fa";
import api from "../api";

export default function Dash() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    api.get("/history", { params: { limit: 200 } }).then(r => setRows(r.data)).catch(() => {});
    api.get("/settings").then(r => setName(r.data.full_name || r.data.username)).catch(() => {});
  }, []);

  const by = t => rows.filter(r => r.translation_type === t).length;
  const T = [
    ["voice", "/app/voice", "Voice Translation", <FaMicrophone key="v" />, "Speak and hear instant audio"],
    ["text", "/app/text", "Text Translation", <FaFont key="t" />, "Translate typed or pasted text"],
    ["vision", "/app/vision", "AI Vision Translator", <FaImage key="i" />, "Extract and translate image text"],
    ["conversation", "/app/conversation", "Two-Way Conversation", <FaComments key="c" />, "Turn-based two-person dialogue"]
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Welcome back, {name || "User"}</h1>

      <div className="dash-grid">
        {T.map(([k, to, n, icon, desc]) => (
          <NavLink key={k} className="tool-card" to={to}>
            <div className="tool-card-icon">{icon}</div>
            <h3>{n}</h3>
            <p className="muted">{by(k)} translations · {desc}</p>
          </NavLink>
        ))}
      </div>

      <h2 className="section-title">Recent translations</h2>
      {rows.length === 0 && (
        <p className="empty-state">Nothing yet. Start with a voice or text translation.</p>
      )}
      {rows.slice(0, 5).map(r => (
        <div className="card recent-card" key={r.id}>
          <div className="recent-meta">
            <span className="history-badge">{r.translation_type}</span>
            <span>{r.source_language} → {r.target_language}</span>
          </div>
          <p className="recent-src">{r.source_text}</p>
          <p className="recent-trans">{r.translated_text}</p>
        </div>
      ))}
    </div>
  );
}
