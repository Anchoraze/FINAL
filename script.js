console.log("Lets Write JS");

/* ------------------ GLOBALS ------------------ */
let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = 0;

/* ------------------ UTILS ------------------ */
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

/* ------------------ LOAD SONGS ------------------ */
async function loadSongs(folder) {
    currFolder = folder;

    try {
        const res = await fetch("songs.json");
        const data = await res.json();

        songs = data[folder] || [];
        console.log("FOUND SONGS:", songs);

        currentIndex = 0;
        updatePlaylistUI();

        if (songs.length > 0) {
            playMusic(songs[0], true);
        }

    } catch (err) {
        console.error("Failed to load songs:", err);
        songs = [];
        document.querySelector(".songList ul").innerHTML = "";
    }
}

/* ------------------ PLAYLIST UI ------------------ */
function updatePlaylistUI() {
    const ul = document.querySelector(".songList ul");
    ul.innerHTML = "";

    songs.forEach((song, i) => {
        ul.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg">
            <div class="info">
                <div>${getOnlyName(song)}</div>
            </div>
            <div class="playnow">
                <div>Play Now</div>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    });

    Array.from(ul.children).forEach((li, i) => {
        li.addEventListener("click", () => {
            currentIndex = i;
            playMusic(songs[currentIndex]);
        });
    });
}

/* ------------------ PLAY MUSIC ------------------ */
function playMusic(track, pause = false) {
    if (!track) return;

    currentSong.src = `songs/${currFolder}/${encodeURIComponent(track)}`;

    document.querySelector(".songinfo").innerText = getOnlyName(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
    document.querySelector(".circle").style.left = "0%";

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        play.src = "img/play.svg";
    }

    highlightCurrentSong();
}

/* ------------------ HIGHLIGHT SONG ------------------ */
function highlightCurrentSong() {
    document.querySelectorAll(".songList li").forEach((li, i) => {
        li.classList.toggle("playing", i === currentIndex);
    });
}

/* ------------------ SEEK BAR ANIMATION ------------------ */
function animateCircle() {
    if (!currentSong.paused && !isNaN(currentSong.duration)) {
        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
    }
    requestAnimationFrame(animateCircle);
}

/* ------------------ MAIN ------------------ */
async function main() {

    /* Card click → load folder */
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async e => {
            const folder = e.currentTarget.dataset.folder;
            await loadSongs(folder);
        });
    });

    /* Play / Pause */
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    /* Previous */
    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            playMusic(songs[currentIndex]);
        }
    });

    /* Next */
    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });

    /* Volume */
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });

    /* Seekbar */
    document.querySelector(".seekbar").addEventListener("click", e => {
        if (isNaN(currentSong.duration)) return;
        const percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
    });

    /* Hamburger */
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    });

    /* Time Update */
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    });

    /* Auto next */
    currentSong.addEventListener("ended", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });

    requestAnimationFrame(animateCircle);
}

main();
