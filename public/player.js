/* global fetch, Audio */
const audio   = document.getElementById('audioElement');
const API_URL = '/next-track';
const LOCAL_FALLBACK = '/audio/fundamental-sound.mp3';

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