import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { err } from "../api";

const GID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleBtn() {
  const nav = useNavigate();
  const [e, setE] = useState("");

  useEffect(() => {
    if (!GID) return;
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GID,
        callback: async r => {
          try {
            const x = await api.post("/auth/google", { credential: r.credential });
            localStorage.setItem("vt_token", x.data.token);
            nav("/app");
          } catch (z) {
            setE(err(z));
          }
        }
      });
      window.google.accounts.id.renderButton(document.getElementById("gbtn"), {
        theme: "outline",
        size: "large",
        width: 336
      });
    };
    document.body.appendChild(s);
    return () => s.remove();
  }, [nav]);

  return GID ? (
    <>
      <div id="gbtn" className="row" />
      {e && (
        <div className="error" role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{e}</span>
        </div>
      )}
    </>
  ) : null;
}

function Form({ title, fields, path, link }) {
  const nav = useNavigate();
  const [v, setV] = useState({});
  const [e, setE] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async ev => {
    ev.preventDefault();
    setE("");
    if (v.confirm !== undefined && v.confirm !== v.password) {
      return setE("Passwords do not match. Please re-enter matching passwords.");
    }
    setBusy(true);
    try {
      const { confirm, ...body } = v;
      const r = await api.post(path, body);
      localStorage.setItem("vt_token", r.data.token);
      nav("/app");
    } catch (x) {
      setE(err(x));
    }
    setBusy(false);
  };

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h2>{title}</h2>
        {fields.map(([k, label, type]) => (
          <label key={k} className="form-label">
            <span>{label}</span>
            <input
              type={type || "text"}
              required
              onChange={x => setV({ ...v, [k]: x.target.value })}
            />
          </label>
        ))}
        {e && (
          <div className="error" role="alert">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <span>{e}</span>
          </div>
        )}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Please wait…" : title}
        </button>
        {path === "/auth/login" && <GoogleBtn />}
        <div className="auth-links">{link}</div>
      </form>
    </div>
  );
}

export const Login = () => (
  <Form
    title="Log in"
    path="/auth/login"
    fields={[
      ["identifier", "Email or username"],
      ["password", "Password", "password"]
    ]}
    link={
      <>
        <p><Link to="/forgot-password">Forgot password?</Link></p>
        <p>New here? <Link to="/register">Create an account</Link></p>
        <p><Link to="/">← Back to home</Link></p>
      </>
    }
  />
);

export const Register = () => (
  <Form
    title="Create account"
    path="/auth/register"
    fields={[
      ["full_name", "Full name"],
      ["username", "Username"],
      ["email", "Email", "email"],
      ["password", "Password (8+ characters)", "password"],
      ["confirm", "Confirm password", "password"]
    ]}
    link={
      <>
        <p>Have an account? <Link to="/login">Log in</Link></p>
        <p><Link to="/">← Back to home</Link></p>
      </>
    }
  />
);
