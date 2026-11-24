import { useEffect, useRef } from "react";

export default function Wave({ stream }) {
  const cv = useRef();

  useEffect(() => {
    if (!stream) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const an = ctx.createAnalyser();
    an.fftSize = 64;
    ctx.createMediaStreamSource(stream).connect(an);
    const d = new Uint8Array(an.frequencyBinCount);
    let raf;

    const draw = () => {
      const c = cv.current;
      if (!c) return;
      const g = c.getContext("2d");
      g.clearRect(0, 0, c.width, c.height);
      an.getByteFrequencyData(d);
      const bars = 24;
      const barWidth = Math.floor(c.width / bars);
      g.fillStyle = "#a3e635";
      for (let i = 0; i < bars; i++) {
        const val = d[i] || 0;
        const h = Math.max(3, (val / 255) * (c.height - 4));
        const x = i * barWidth + 2;
        const y = (c.height - h) / 2;
        g.fillRect(x, y, barWidth - 4, h);
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      ctx.close();
    };
  }, [stream]);

  if (!stream) return null;
  return (
    <div className="wave-container" aria-label="Audio level meter">
      <canvas ref={cv} width="320" height="32" className="wave-canvas" />
    </div>
  );
}
