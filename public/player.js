// player.js
import { initVisualizer } from './visualizer.js'; // 👈 ADD THIS IMPORT

const audio = document.getElementById('audioElement');
const API_URL = '/next-track';
const LOCAL_FALLBACK = '/audio/fundamental-sound.mp3';
let visualizerInitialized = false; // 👈 ADD THIS FLAG

// This function is for a "Play" button the user must click
async function startPlayback() {
  // Only initialize the visualizer once
  if (!visualizerInitialized) {
    initVisualizer(); // 👈 CALL THE INITIALIZER
    visualizerInitialized = true;
  }
  
  await pickTrack();
}

async function pickTrack() {
  try {
    const { url } = await (await fetch(API_URL, { cache: 'no-store' })).json();
    if (audio.src !== url) {
      audio.src = url;
      audio.loop = false;
      await audio.play();
    }
  } catch (err) {
    if (audio.src !== LOCAL_FALLBACK) {
      audio.src = LOCAL_FALLBACK;
      audio.loop = true;
      await audio.play().catch(() => {});
    }
  }
}

// You will need a play button in your index.html
const playButton = document.getElementById('playButton'); 
playButton.addEventListener('click', startPlayback, { once: true });

audio.addEventListener('ended', pickTrack);

document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById('playButton');
  const audio = document.querySelector('audio');

  playButton.addEventListener('click', async () => {
    // 1. Create AudioContext and AnalyserNode FIRST
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();

    // 2. Connect the audio graph: source -> analyser -> destination
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    try {
      // 3. Fetch the track URL
      const response = await fetch('/next-track');
      const data = await response.json();
      audio.src = data.url;

      // 4. Play the audio
      await audio.play();

      // 5. Hide the play button
      playButton.style.display = 'none';

      // 6. Start the visualizer
      if (typeof drawVisualizer === 'function') {
        drawVisualizer(analyser);
      }
    } catch (error) {
      console.error('Error fetching or playing track:', error);
      // Fallback for local testing or if the API fails
      audio.src = '/audio/fundamental-sound.mp3';
      await audio.play();
      if (typeof drawVisualizer === 'function') {
        drawVisualizer(analyser);
      }
    }
  });
});

async function pickTrack() {
  try {
    const { url } = await (await fetch(API_URL, { cache: 'no-store' })).json();
    if (audio.src !== url) {
      audio.src  = url;
      audio.loop = false;
      await audio.play();
    }
  } catch (err) {
    // network / Worker error → fallback
    if (audio.src !== LOCAL_FALLBACK) {
      audio.src  = LOCAL_FALLBACK;
      audio.loop = true;
      await audio.play().catch(()=>{});
    }
  }
}

audio.addEventListener('ended', pickTrack);

pickTrack();
setInterval(pickTrack, 30_000);