import { LANGS, audioSrc, downloadAudio } from "../api";

export default function LangPair({ src, tgt, setSrc, setTgt }) {
  const O = () =>
    Object.entries(LANGS).map(([k, n]) => (
      <option key={k} value={k}>{n}</option>
    ));

  return (
    <div className="lang-row">
      <div className="lang-field">
        <label className="lang-label" htmlFor="source-lang-select">Source language</label>
        <select
          id="source-lang-select"
          className="lang-select"
          value={src}
          onChange={e => setSrc(e.target.value)}
        >
          <O />
        </select>
      </div>

      <button
        type="button"
        className="btn ghost swap-btn"
        onClick={() => {
          setSrc(tgt);
          setTgt(src);
        }}
        aria-label="Swap languages"
        title="Swap source and target languages"
      >
        <span className="swap-icon" aria-hidden="true">⇄</span> Swap
      </button>

      <div className="lang-field">
        <label className="lang-label" htmlFor="target-lang-select">Target language</label>
        <select
          id="target-lang-select"
          className="lang-select"
          value={tgt}
          onChange={e => setTgt(e.target.value)}
        >
          <O />
        </select>
      </div>
    </div>
  );
}

export const Result = ({ r, onAgain }) => {
  if (!r) return null;
  return (
    <div className="card result-card" aria-live="polite">
      <div className="result-block">
        <span className="result-label">Original text</span>
        <p className="result-text">{r.original_text}</p>
      </div>

      <div className="result-block">
        <span className="result-label">Translation</span>
        <p className="result-text translation-text">{r.translated_text}</p>
      </div>

      <div className="result-actions">
        <button
          type="button"
          className="btn ghost btn-sm"
          onClick={() => navigator.clipboard.writeText(r.translated_text)}
        >
          Copy
        </button>

        {r.audio_url && (
          <>
            <audio
              key={r.audio_url}
              controls
              className="result-audio"
              src={audioSrc(r.audio_url)}
              aria-label="Audio pronunciation"
            />
            <button
              type="button"
              className="btn ghost btn-sm"
              onClick={() => downloadAudio(r.audio_url)}
            >
              Download audio
            </button>
          </>
        )}

        {onAgain && (
          <button
            type="button"
            className="btn ghost btn-sm"
            onClick={onAgain}
          >
            Translate again
          </button>
        )}
      </div>
    </div>
  );
};
