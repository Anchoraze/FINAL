console.log("Lets Write JS");

/* ================== GLOBAL STATE ================== */
let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = 0;

/* ================== UTILS ================== */
function getOnlyName(path) {
    return path.split(/[/\\]/).pop();
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    seconds = Math.floor(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/* ================== LOAD SONGS FROM JSON ================== */
async function loadSongs(folder) {
    currFolder = folder;

    try {
        const res = await fetch("songs.json");
        const data = await res.json();

        songs = data[folder] || [];
        console.log("FOUND SONGS:", songs);

        currentIndex = 0;
        renderPlaylist();

        if (songs.length > 0) {
            playMusic(songs[0], true);
        }

    } catch (err) {
        console.error("Song loading failed", err);
        document.querySelector(".songList ul").innerHTML = "";
    }
}

/* ================== RENDER PLAYLIST ================== */
function renderPlaylist() {
    const ul = document.querySelector(".songList ul");
    ul.innerHTML = "";

    songs.forEach((song, i) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <img class="invert" src="img/music.svg" />
            <div class="info">
                <div>${getOnlyName(song)}</div>
            </div>
            <div class="playnow">
                <div>Play Now</div>
                <img class="invert" src="img/play.svg" />
            </div>
        `;

        li.addEventListener("click", () => {
            currentIndex = i;
            playMusic(songs[currentIndex]);
        });

        ul.appendChild(li);
    });

    highlightCurrent();
}

/* ================== PLAY MUSIC ================== */
function playMusic(track, pause = false) {
    if (!track) return;

    currentSong.src = `songs/${currFolder}/${encodeURIComponent(track)}`;
    currentSong.load(); // 🔥 REQUIRED FOR MOBILE

    document.querySelector(".songinfo").innerText = getOnlyName(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
    document.querySelector(".circle").style.left = "0%";

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        play.src = "img/play.svg";
    }

    highlightCurrent();
}

/* ================== HIGHLIGHT CURRENT SONG ================== */
function highlightCurrent() {
    const lis = document.querySelectorAll(".songList li");
    lis.forEach((li, i) => {
        li.style.background = i === currentIndex ? "#333" : "";
    });
}

/* ================== ANIMATE SEEK CIRCLE ================== */
function animateCircle() {
    if (
        !currentSong.paused &&
        currentSong.duration &&
        !isNaN(currentSong.duration)
    ) {
        const percent =
            (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
    }
    requestAnimationFrame(animateCircle);
}

/* ================== MAIN ================== */
async function main() {

    /* ---- CARD CLICK (LOAD FOLDER) ---- */
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            if (folder) await loadSongs(folder);
        });
    });

    /* ---- DEFAULT PLAYLIST (IMPORTANT) ---- */
    await loadSongs("valo"); // 🔥 DO NOT REMOVE

    /* ---- PLAY / PAUSE ---- */
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    /* ---- NEXT ---- */
    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });

    /* ---- PREVIOUS ---- */
    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            playMusic(songs[currentIndex]);
        }
    });

    /* ---- TIME UPDATE ---- */
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    });

    /* ---- AUTO NEXT ---- */
    currentSong.addEventListener("ended", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });

    /* ---- SEEK ---- */
    document.querySelector(".seekbar").addEventListener("click", e => {
        const width = e.target.getBoundingClientRect().width;
        const percent = e.offsetX / width;
        currentSong.currentTime = percent * currentSong.duration;
    });

    /* ---- VOLUME ---- */
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });

    /* ---- HAMBURGER ---- */
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    });

    requestAnimationFrame(animateCircle);
}

main();
