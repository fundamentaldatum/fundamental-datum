// visualizer.js – cleaned‑up & modular  (drop this file into public/)
// ---------------------------------------------------------------
//  * Generates a 4×4 canvas grid (16 squares) that fills the viewport.
//  * Hooks up a single AnalyserNode to <audio id="audioElement">.
//  * Draw loop uses requestAnimationFrame and clears efficiently.
//  * Automatically resumes AudioContext on first user gesture to
//    satisfy mobile autoplay rules.
// ---------------------------------------------------------------

class Visualizer {
  // 1. Update the constructor to accept the audio element and context
  constructor(canvas, audioElement, audioContext) {
      this.canvas = canvas;
      this.canvasCtx = this.canvas.getContext('2d');
      this.audioElement = audioElement; // Store the audio element
      this.audioCtx = audioContext;   // Use the shared context

      // 2. Create the AnalyserNode
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;

      // 3. Create the source from the audio element and connect it
      //    This is the most critical change
      const source = this.audioCtx.createMediaElementSource(this.audioElement);
      source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination); // Connect analyser to output

      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      this.draw();
  }

  draw() {
      requestAnimationFrame(() => this.draw());

      this.analyser.getByteTimeDomainData(this.dataArray);

      this.canvasCtx.fillStyle = 'rgb(255, 255, 255)';
      this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.canvasCtx.lineWidth = 2;
      this.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

      this.canvasCtx.beginPath();

      const sliceWidth = this.canvas.width * 1.0 / this.bufferLength;
      let x = 0;

      for (let i = 0; i < this.bufferLength; i++) {
          const v = this.dataArray[i] / 128.0;
          const y = v * this.canvas.height / 2;

          if (i === 0) {
              this.canvasCtx.moveTo(x, y);
          } else {
              this.canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
      }

      this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
      this.canvasCtx.stroke();
  }
}