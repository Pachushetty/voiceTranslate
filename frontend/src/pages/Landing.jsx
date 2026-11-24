import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LANGS } from "../api";

const PH = [
  ["Hello, how are you?", "English"],
  ["नमस्ते, आप कैसे हैं?", "Hindi"],
  ["ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?", "Kannada"],
  ["வணக்கம், எப்படி இருக்கிறீர்கள்?", "Tamil"],
  ["Hola, ¿cómo estás?", "Spanish"],
  ["こんにちは、お元気ですか？", "Japanese"]
];

export default function Landing() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI(x => (x % (PH.length - 1)) + 1), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-brand">VoiceTranslate</span>
        <span>
          <Link to="/login" className="btn ghost btn-sm">Log in</Link>
        </span>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Break Language Barriers. Speak Without Limits.</h1>
          <p>
            Record your voice, get a translation in seconds, and hear it spoken back in {Object.keys(LANGS).length} languages, including Hindi, Kannada and Tamil.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/register">Get Started</Link>
            <a className="btn ghost" href="#features">Explore Features</a>
          </div>
        </div>

        <div className="demo-card" aria-live="polite">
          <span className="demo-lang-label">English</span>
          <p className="demo-src-text">{PH[0][0]}</p>
          <hr className="demo-divider" />
          <span className="demo-lang-label">{PH[i || 1][1]}</span>
          <div className="demo-out-text">{PH[i || 1][0]}</div>
        </div>
      </section>

      <section id="features" className="pad">
        <h2 className="section-title">What you can do</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Voice to voice</h3>
            <p>Speak naturally and hear the translation read aloud with realistic voice speech.</p>
          </div>
          <div className="feature-card">
            <h3>Text translation</h3>
            <p>Translate text passages quickly with Gemini AI and Google Translate fallback.</p>
          </div>
          <div className="feature-card">
            <h3>Image text</h3>
            <p>Photograph or upload signs, documents, and menus to extract and translate text.</p>
          </div>
          <div className="feature-card">
            <h3>Two-way conversation</h3>
            <p>Two people take turns speaking across different languages with clear speaker turns.</p>
          </div>
          <div className="feature-card">
            <h3>Audio pronunciation</h3>
            <p>Listen to high-quality audio playback and download audio for offline reference.</p>
          </div>
          <div className="feature-card">
            <h3>Translation history</h3>
            <p>Every translation is saved to your account with fast search and copy actions.</p>
          </div>
        </div>
      </section>

      <section className="pad">
        <h2 className="section-title">Supported languages</h2>
        <div className="chips">
          {Object.values(LANGS).map(n => (
            <span key={n} className="chip">{n}</span>
          ))}
        </div>
      </section>

      <section className="pad">
        <h2 className="section-title">How it works</h2>
        <ol className="steps-grid">
          <li className="step-card">
            <span className="step-badge">1</span>
            <div className="step-title">Choose languages</div>
            <p className="step-desc">Pick the language you speak and the language you need.</p>
          </li>
          <li className="step-card">
            <span className="step-badge">2</span>
            <div className="step-title">Provide input</div>
            <p className="step-desc">Record your voice, type your text, or upload an image file.</p>
          </li>
          <li className="step-card">
            <span className="step-badge">3</span>
            <div className="step-title">Read and listen</div>
            <p className="step-desc">Read the translated text and play it back as natural speech.</p>
          </li>
        </ol>
      </section>

      <footer className="landing-footer">

      </footer>
    </div>
  );
}
