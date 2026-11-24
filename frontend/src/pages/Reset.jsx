import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { err } from "../api";

export function Forgot() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [e, setE] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async ev => {
    ev.preventDefault();
    setE("");
    setMsg("");
    setBusy(true);
    try {
      setMsg((await api.post("/auth/forgot", { email })).data.message);
    } catch (x) {
      setE(err(x));
    }
    setBusy(false);
  };

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={go}>
        <h2>Reset password</h2>
        <label className="form-label">
          <span>Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={x => setEmail(x.target.value)}
            placeholder="you@example.com"
          />
        </label>
        {msg && <div className="status-success" role="status"><span>✓</span> {msg}</div>}
        {e && (
          <div className="error" role="alert">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <span>{e}</span>
          </div>
        )}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Sending…" : "Send reset link"}
        </button>
        <div className="auth-links">
          <p><Link to="/login">Back to log in</Link></p>
        </div>
      </form>
    </div>
  );
}

export function ResetPassword() {
  const [q] = useSearchParams();
  const [p, setP] = useState("");
  const [c, setC] = useState("");
  const [e, setE] = useState("");
  const [done, setDone] = useState(false);

  const go = async ev => {
    ev.preventDefault();
    setE("");
    if (p !== c) return setE("Passwords do not match. Please re-enter matching passwords.");
    try {
      await api.post("/auth/reset", { token: q.get("token") || "", password: p });
      setDone(true);
    } catch (x) {
      setE(err(x));
    }
  };

  return (
    <div className="auth">
      <nav className="auth-nav">
        <Link to="/" className="auth-back-btn" aria-label="Back to home page">
          <span aria-hidden="true">←</span>
          <span>Back to home</span>
        </Link>
      </nav>
      <form className="auth-card" onSubmit={go}>
        <h2>Choose a new password</h2>
        {done ? (
          <div className="status-success" role="status">
            <span>✓</span> Password changed. <Link to="/login">Log in</Link>
          </div>
        ) : (
          <>
            <label className="form-label">
              <span>New password (8+ characters)</span>
              <input
                type="password"
                minLength="8"
                required
                onChange={x => setP(x.target.value)}
              />
            </label>
            <label className="form-label">
              <span>Confirm password</span>
              <input
                type="password"
                required
                onChange={x => setC(x.target.value)}
              />
            </label>
            {e && (
              <div className="error" role="alert">
                <span className="error-icon" aria-hidden="true">⚠️</span>
                <span>{e}</span>
              </div>
            )}
            <button type="submit" className="btn">Change password</button>
          </>
        )}
        <div className="auth-links">
          <p><Link to="/login">Back to log in</Link></p>
          <p><Link to="/">← Back to home</Link></p>
        </div>
      </form>
    </div>
  );
}
