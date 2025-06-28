// Get DOM elements
const audioPlayer = document.getElementById('audio-player');
const playButton = document.getElementById('play-button');
const trackInfo = document.getElementById('track-info');
const visualizerCanvas = document.getElementById('visualizer-canvas');

// 1. Create a single, shared AudioContext.
//    This will be the engine for all audio processing.
const audioContext = new AudioContext();

// 2. Pass the audio element and the shared context to the Visualizer.
//    This connects the visualizer to the audio being played.
const visualizer = new Visualizer(visualizerCanvas, audioPlayer, audioContext);

let isPlaying = false;

// Function to fetch the next track from the serverless backend
async function fetchNextTrack() {
    try {
        const response = await fetch('/next-track');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        audioPlayer.src = data.trackUrl;
        trackInfo.textContent = `Now Playing: ${data.trackName}`;
    } catch (error) {
        console.error("Could not fetch the next track:", error);
        trackInfo.textContent = 'Error loading track.';
    }
}

// Event listener for the play button
playButton.addEventListener('click', () => {
    // 3. Resume the AudioContext on user interaction (very important for modern browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // Toggle play/pause state
    if (isPlaying) {
        audioPlayer.pause();
        playButton.textContent = 'Play';
    } else {
        // If a track is loaded, play it. Otherwise, fetch one first.
        if (audioPlayer.src) {
            audioPlayer.play();
            playButton.textContent = 'Pause';
        } else {
            fetchNextTrack().then(() => {
                audioPlayer.play();
                playButton.textContent = 'Pause';
            });
        }
    }
    isPlaying = !isPlaying;
});

// Event listener to automatically play the next track when the current one ends
audioPlayer.addEventListener('ended', () => {
    fetchNextTrack().then(() => {
        if (isPlaying) {
            audioPlayer.play();
        }
    });
});

// Fetch the initial track when the page loads
fetchNextTrack();