// visualizer.js – cleaned‑up & modular  (drop this file into public/)
// ---------------------------------------------------------------
//  * Generates a 4×4 canvas grid (16 squares) that fills the viewport.
//  * Hooks up a single AnalyserNode to <audio id="audioElement">.
//  * Draw loop uses requestAnimationFrame and clears efficiently.
//  * Automatically resumes AudioContext on first user gesture to
//    satisfy mobile autoplay rules.
// ---------------------------------------------------------------

export function initVisualizer() {
    const audio = document.getElementById('audioElement');
    if (!audio) throw new Error('audioElement not found');
  
    /* 1.  Create canvases & attach ------------------------------------------------ */
    const wrapper = document.getElementById('canvasWrapper');
    const CANVAS_COUNT = 16;
    const canvases = Array.from({ length: CANVAS_COUNT }, () => {
      const c = document.createElement('canvas');
      wrapper.appendChild(c);
      return c;
    });
    const ctxs = canvases.map(c => c.getContext('2d'));
  
    /* 2.  Size all canvases to fill grid ---------------------------------------- */
    function resize() {
      const { clientWidth: W, clientHeight: H } = wrapper;
      canvases.forEach(c => {
        c.width  = W / 4;
        c.height = H / 4;
      });
    }
    resize();
    addEventListener('resize', resize);
  
    /* 3.  AudioContext + analyser ------------------------------------------------ */
    const ac        = new (window.AudioContext || window.webkitAudioContext)();
    const analyser  = ac.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLen = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLen);
  
    const src = ac.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(ac.destination);
  
    /* 4.  Mobile autoplay fix ---------------------------------------------------- */
    const resumeAC = () => ac.state === 'suspended' && ac.resume();
    addEventListener('click', resumeAC, { once: true, capture: true });
    addEventListener('touchstart', resumeAC, { once: true, capture: true });
  
    /* 5.  Draw loop -------------------------------------------------------------- */
    ctxs.forEach(ctx => {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0,255,0,0.8)';  // oscilloscope green
      ctx.globalCompositeOperation = 'lighten';
    });
  
    function draw() {
      analyser.getByteTimeDomainData(dataArray);
  
      ctxs.forEach((ctx, i) => {
        const { width: W, height: H } = ctx.canvas;
        ctx.clearRect(0, 0, W, H);
  
        ctx.beginPath();
        const slice = bufferLen / W;                // scale to canvas width
        for (let x = 0; x < W; x++) {
          const v = dataArray[Math.floor(x * slice)] / 128.0; // 0‑255 → centred
          const y = v * H / 2;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
  
  // Auto‑init when script is loaded late in <body>
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initVisualizer();
  } else {
    addEventListener('DOMContentLoaded', initVisualizer);}