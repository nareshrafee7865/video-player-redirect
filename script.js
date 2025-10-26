const video = document.getElementById("player");
const image = document.getElementById("image");

let playlist = [];
let current = 0;
let soundUnlocked = false;

// Overlay to unlock sound
const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = 0;
overlay.style.left = 0;
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.background = "rgba(0,0,0,0.7)";
overlay.style.color = "white";
overlay.style.display = "flex";
overlay.style.alignItems = "center";
overlay.style.justifyContent = "center";
overlay.style.fontSize = "26px";
overlay.style.cursor = "pointer";
overlay.style.zIndex = 1000;
overlay.innerText = "Tap anywhere to enable sound";
document.body.appendChild(overlay);

overlay.addEventListener("click", async () => {
  try {
    soundUnlocked = true;
    video.muted = false;
    await video.play();
    overlay.remove();
  } catch (e) {
    console.warn("Autoplay with sound failed, retrying muted:", e);
    video.muted = true;
    await video.play();
  }
});

// Fetch playlist
async function fetchPlaylist() {
  try {
    const res = await fetch("/playlist");
    playlist = await res.json(); // replace existing playlist
  } catch (err) {
    console.error("Error fetching playlist:", err);
  }
}

// Play next media
function playNext() {
  if (!playlist.length) return;

  const item = playlist[current];

  if (item.type === "video") {
    image.style.display = "none";
    video.style.display = "block";
    video.src = `/media/${item.file}`;
    video.muted = !soundUnlocked;
    video.load();

    video.play().catch(err => console.warn("Autoplay failed:", err));

    video.onended = () => {
      current = (current + 1) % playlist.length;
      playNext();
    };

  } else if (item.type === "image") {
    video.pause();
    video.style.display = "none";
    image.src = `/media/${item.file}`;
    image.style.display = "block";

    setTimeout(() => {
      current = (current + 1) % playlist.length;
      playNext();
    }, 5000);
  }
}

// Auto-refresh playlist every 30s
setInterval(fetchPlaylist, 30000);

// Start playlist
(async () => {
  await fetchPlaylist();
  if (playlist.length) playNext();
})();
