document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById('playButton');
  const audio = document.querySelector('audio');

  playButton.addEventListener('click', async () => {
    // Lazily create the AudioContext here, as recommended by Google and Mozilla.
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    try {
      const response = await fetch('/next-track');
      const data = await response.json();
      audio.src = data.url;
      await audio.play();
      playButton.style.display = 'none'; // Hide the button after play starts
      // Now that audio is playing, start the visualizer
      if (typeof drawVisualizer === 'function') {
        drawVisualizer(analyser);
      }
    } catch (error) {
      console.error('Error fetching or playing track:', error);
      // Play fallback track
      audio.src = '/audio/fundamental-sound.mp3';
      await audio.play();
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