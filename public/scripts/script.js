const btnSounds = document.getElementById("btn-sounds");
const btnMusic = document.getElementById("btn-music");
const loginLink = document.querySelector('.login-link')
const authEmbed = document.getElementById('auth-embed')
const profileDropdown = document.getElementById('profile-dropdown')
const tabLogin = document.getElementById('tab-login')
const tabRegister = document.getElementById('tab-register')
const loginForm = document.getElementById('login-form')
const registerForm = document.getElementById('register-form')
const authCloseButtons = document.querySelectorAll('.auth-close')
const authOverlayList = document.querySelectorAll('.auth-overlay')
const btnLogout = document.getElementById('btn-logout')
const btnLinkGoogle = document.getElementById('btn-link-google')
const btnLinkFb = document.getElementById('btn-link-fb')

function openAuth(tab = 'login') {
    document.body.classList.add('modal-open')
    authEmbed.classList.remove('hidden')
    authEmbed.setAttribute('aria-hidden', 'false')
    if (tab === 'register') showRegister()
    else showLogin()
}

function closeAuth() {
    authEmbed.classList.add('hidden')
    authEmbed.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
}

function showLogin() {
    tabLogin.classList.add('active')
    tabRegister.classList.remove('active')
    loginForm.classList.add('active')
    loginForm.classList.remove('hidden')
    registerForm.classList.remove('active')
    registerForm.classList.add('hidden')
}

function showRegister() {
    tabRegister.classList.add('active')
    tabLogin.classList.remove('active')
    registerForm.classList.add('active')
    registerForm.classList.remove('hidden')
    loginForm.classList.remove('active')
    loginForm.classList.add('hidden')
}

function toggleProfileDropdown() {
    profileDropdown.classList.toggle('hidden')
}

loginLink.addEventListener('click', async (e) => {
    e.preventDefault()
    try {
        const res = await fetch('/me')
        if (res.ok) {
            toggleProfileDropdown()
        } else {
            openAuth('login')
        }
    } catch (err) {
        openAuth('login')
    }
})
authCloseButtons.forEach((btn) => btn.addEventListener('click', closeAuth))
authOverlayList.forEach((ov) => ov.addEventListener('click', closeAuth))
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuth()
})
tabLogin.addEventListener('click', showLogin)
tabRegister.addEventListener('click', showRegister)
document.addEventListener('click', (e) => {
    const within = e.target.closest('#profile-dropdown')
    const onLoginLink = e.target.closest('.login-link')
    if (!within && !onLoginLink) profileDropdown.classList.add('hidden')
})

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const usermail = document.getElementById('login-usermail').value.trim()
    const password = document.getElementById('login-password').value
    const resp = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ usermail, password })
    })
    if (resp.ok) {
        await refreshProfile()
        closeAuth()
    } else alert(await resp.text())
})

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = document.getElementById('reg-name').value.trim()
    const username = document.getElementById('reg-username').value.trim()
    const email = document.getElementById('reg-email').value.trim()
    const password = document.getElementById('reg-password').value
    const resp = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name, username, email, password })
    })
    if (resp.ok) {
        await refreshProfile()
        closeAuth()
    } else alert(await resp.text())
})

btnLogout.addEventListener('click', async () => {
    await fetch('/logout')
    profileDropdown.classList.add('hidden')
    await refreshProfile()
})
btnLinkGoogle.addEventListener('click', () => (window.location.href = '/link/google'))
btnLinkFb.addEventListener('click', () => (window.location.href = '/link/facebook'))

async function refreshProfile() {
    const r = await fetch('/me')
    const loginEl = document.querySelector('.login-link')
    if (!r.ok) {
        if (loginEl) loginEl.innerHTML = '<span>Увійти</span>'
        return
    }
    const user = await r.json()
    const avatarUrl = user.avatar || 'images/default-avatar.png'
    if (loginEl)
        loginEl.innerHTML = `<img src="${avatarUrl}" alt="Профіль" class="avatar" style="width:34px;height:34px;border-radius:50%;object-fit:cover">`
    document.getElementById('profile-name').textContent =
        user.username || user.name || 'Користувач'
    document.getElementById('profile-email').textContent = user.email || ''
    document.getElementById('profile-avatar').src = avatarUrl
    if (user.google_id) btnLinkGoogle.style.display = 'none'
    if (user.facebook_id) btnLinkFb.style.display = 'none'
}

refreshProfile()

//    =========================================================================================================

let currentMode = "music";
let geojsonLayer;
let sounds = {};
let allCategories = [];
let playbackCircle = null;
let currentlyPlaying = false;
let lastClickedRegion = null;
let playbackTimeoutId = null;


const playlists = [
    { name_en: "Lviv Oblast", name_uk: "Львівська область", playlist: "https://open.spotify.com/embed/playlist/37i9dQZF1DX7gIoKXt0gmx?utm_source=generator" },
    { name_en: "Volyn Oblast", name_uk: "Волинська область", playlist: "https://open.spotify.com/embed/playlist/61OTpxcxvKcncbWYfxJG0h?utm_source=generator" },
    { name_en: "Zakarpattia Oblast", name_uk: "Закарпатська область", playlist: "https://open.spotify.com/embed/playlist/5oPgfiISFbOIleLgeKrANW?utm_source=generator" },
    { name_en: "Ivano-Frankivsk Oblast", name_uk: "Івано-Франківська область", playlist: "https://open.spotify.com/embed/playlist/4I20xi99T7YoYsApYZLzEx?utm_source=generator" },
    { name_en: "Ternopil Oblast", name_uk: "Тернопільська область", playlist: "https://open.spotify.com/embed/playlist/5Mu8JspiNnrtZKBPBYHhkB?utm_source=generator" },
    { name_en: "Kharkiv Oblast", name_uk: "Харківська область", playlist: "https://open.spotify.com/embed/playlist/2pOx55wWxI1vsLitqtpp60?utm_source=generator" },
    { name_en: "Luhansk Oblast", name_uk: "Луганська область", playlist: "https://open.spotify.com/embed/playlist/1pBcu7pquxneAFxcsmb671?utm_source=generator" },
    { name_en: "Donetsk Oblast", name_uk: "Донецька область", playlist: "https://open.spotify.com/embed/playlist/7sl24S6mRCO09MTXUmu2k3?utm_source=generator" },
    { name_en: "Zaporizhia Oblast", name_uk: "Запорізька область", playlist: "https://open.spotify.com/embed/playlist/12ncb1YwgH2QGDr4id09lL?utm_source=generator" },
    { name_en: "Crimea", name_uk: "Крим", playlist: "https://open.spotify.com/embed/playlist/2Fy4rQtZt3M67paPLnBGDy?utm_source=generator" },
    { name_en: "Kyiv Oblast", name_uk: "Київська область", playlist: "https://open.spotify.com/embed/playlist/5n8q1jMUZvukluXGrK59ud?utm_source=generator" },
    { name_en: "Zhytomyr Oblast", name_uk: "Житомирська область", playlist: "https://open.spotify.com/embed/playlist/6wY5dYvNyaZ6KDjYFxGjnA?utm_source=generator" },
    { name_en: "Chernivtsi Oblast", name_uk: "Чернівецька область", playlist: "https://open.spotify.com/embed/playlist/31ypb5JEcrvGlGFXtoyyAy?utm_source=generator" },
    { name_en: "Khmelnytskyi Oblast", name_uk: "Хмельницька область", playlist: "https://open.spotify.com/embed/playlist/05j94JqODbqnK2bnhZmfB5?utm_source=generator" },
    { name_en: "Rivne Oblast", name_uk: "Рівненська область", playlist: "https://open.spotify.com/embed/playlist/0Bht3kby2V9Q8BbDKe1kkY?utm_source=generator" },
    { name_en: "Kherson Oblast", name_uk: "Херсонська область", playlist: "https://open.spotify.com/embed/playlist/2ByILCBJFvztz6715TMT4E?utm_source=generator" },
    { name_en: "Dnipropetrovsk Oblast", name_uk: "Дніпропетровська область", playlist: "https://open.spotify.com/embed/playlist/6emNP4N4ikf3cfDhS8Q4hf?utm_source=generator" },
    { name_en: "Kirovohrad Oblast", name_uk: "Кіровоградська область", playlist: "https://open.spotify.com/embed/playlist/6hzjgiEvJjXi2Hnr3CocEm?utm_source=generator" },
    { name_en: "Odessa Oblast", name_uk: "Одеська область", playlist: "https://open.spotify.com/embed/playlist/2pVF5RrQw1DVwGIgPcMrXD?utm_source=generator" },
    { name_en: "Mykolaiv Oblast", name_uk: "Миколаївська область", playlist: "https://open.spotify.com/embed/playlist/1FW6Fgxn3DXUOGfIIs834v?utm_source=generator" },
    { name_en: "Chernihiv Oblast", name_uk: "Чернігівська область", playlist: "https://open.spotify.com/embed/playlist/63MRfNIjbDorHgfyPUqntF?utm_source=generator" },
    { name_en: "Sumy Oblast", name_uk: "Сумська область", playlist: "https://open.spotify.com/embed/playlist/1754eV67gtIpKfmaubVDLj?utm_source=generator" },
    { name_en: "Poltava Oblast", name_uk: "Полтавська область", playlist: "https://open.spotify.com/embed/playlist/1m1P8XfkrnLtuJzTFfhwM4?utm_source=generator" },
    { name_en: "Cherkasy Oblast", name_uk: "Черкаська область", playlist: "https://open.spotify.com/embed/playlist/50ZfCmAEXHG55xGOiSnxyp?utm_source=generator" },
    { name_en: "Vinnytsia Oblast", name_uk: "Вінницька область", playlist: "https://open.spotify.com/embed/playlist/4TPRVHImP6rdPbX8rZU3ES?utm_source=generator" }
];

btnSounds.addEventListener("click", () => setActive(btnSounds, "sounds"));
btnMusic.addEventListener("click", () => setActive(btnMusic, "music"));
setActive(btnMusic, "music");

const map = L.map('map', { center: [48.5, 31.2], zoom: 6, zoomControl: true });

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

fetch('data/Ukraine.geojson')
    .then(res => res.json())
    .then(data => {
        geojsonLayer = L.geoJSON(data, {
            style: feature => getRegionStyle(feature),
            onEachFeature: (feature, layer) => {
                const regionName = feature.properties.shapeName;
                const playlistData = playlists.find(p =>
                    p.name_uk === regionName || p.name_en === regionName
                );

                layer.on({
                    mouseover: e => { e.target.setStyle({ weight: 3, fillOpacity: 0.3 }); e.target.bringToFront(); },
                    mouseout: e => { e.target.setStyle(getRegionStyle(e.target.feature)); },
                    click: (e) => {
                        const bounds = e.target.getBounds();
                        const center = bounds.getCenter();
                        lastClickedRegion = { lat: center.lat, lng: center.lng, name: regionName };

                        if (currentMode === "music") {
                            if (playlistData) openMusicPlayer(playlistData.name_uk, playlistData.playlist);
                            else alert(`Немає плейлисту для області: ${regionName}`);
                        } else openSoundList(regionName);
                    }
                });
            }
        }).addTo(map);
    })
    .catch(err => console.error('Помилка завантаження GeoJSON:', err));

function setActive(button, mode) {
    [btnSounds, btnMusic].forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    currentMode = mode;
    updateButtonsMode();
}

function updateButtonsMode() {
    document.querySelectorAll('.city-button, .sound-button').forEach(btn => {
        btn.classList.remove('music-mode', 'sounds-mode');
        btn.classList.add(`${currentMode}-mode`);
    });

    const mapContainer = document.getElementById('map');
    mapContainer.classList.remove('music-mode', 'sounds-mode');
    mapContainer.classList.add(`${currentMode}-mode`);

    if (geojsonLayer) geojsonLayer.eachLayer(layer => layer.setStyle(getRegionStyle(layer.feature)));

    // --- Оновлення title у <head> ---
    if (currentMode === "music") {
        document.title = "Мапа музики України";
    } else if (currentMode === "sounds") {
        document.title = "Мапа звуків України";
    }
}

function getRegionStyle(feature) {
    return { color: currentMode === "music" ? '#1E90FF' : '#2d9e2d', weight: 2, fillOpacity: 0.1 };
}

function normalizeRegion(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '').replace('oblast','').trim();
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

async function loadSoundsCSV() {
    const res = await fetch('data/sounds.csv');
    const text = await res.text();
    const rows = text.split('\n').map(r => r.trim()).filter(r => r);

    rows.forEach(row => {
        const cols = parseCSVLine(row);
        const [title, description, city, category, image, audio, region] = cols;

        sounds[title] = { title, description, city, category, image, audio, region };

        if (category && !allCategories.includes(category)) {
            allCategories.push(category);
        }
    });

    console.log('Завантажено звуків:', Object.keys(sounds).length);
    console.log('Всі категорії:', allCategories);
}
loadSoundsCSV();

function openSoundList(regionFilter = null) {
    const existingList = document.querySelector('.audio-window.sound-list');
    const existing = document.querySelector('.audio-sound-window');
    if (existing) existing.remove();
    if (existingList) existingList.remove();
    stopPlaybackAnimation();

    const playerWindow = document.createElement('div');
    playerWindow.classList.add('audio-window', 'sound-list');

    const filteredSounds = Object.values(sounds).filter(s =>
        !regionFilter || normalizeRegion(s.region) === normalizeRegion(regionFilter)
    );

    const categoriesSet = new Set(filteredSounds.map(s => s.category));
    const categories = Array.from(categoriesSet);

    let categoriesHTML = `<div class="audio-categories"><button class="category-btn active" data-category="all">Всі</button>`;
    categories.forEach(cat => categoriesHTML += `<button class="category-btn" data-category="${cat}">${cat}</button>`);
    categoriesHTML += `</div>`;

    const audioListHTML = `<div class="audio-list vertical-scroll">` +
        filteredSounds.map(s => `<div class="audio-item" data-sound="${s.title}"><span class="audio-item-title">${s.title}</span></div>`).join('') +
        `</div>`;

    playerWindow.innerHTML = `
        <div class="audio-header">
            <span class="audio-title-header">${regionFilter ? regionFilter : 'Звуки'}</span>
            <button class="audio-close">✖</button>
        </div>
        <div class="audio-body">
            ${categoriesHTML}
            ${audioListHTML}
        </div>
        <div class="audio-resizer"></div>
    `;

    document.body.appendChild(playerWindow);

    const scrollContainer = playerWindow.querySelector('.vertical-scroll');
    scrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        scrollContainer.scrollTop += e.deltaY;
    });
    playerWindow.querySelector('.audio-close').onclick = () => playerWindow.remove();

    playerWindow.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            playerWindow.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.category;
            const listContainer = playerWindow.querySelector('.audio-list');
            listContainer.innerHTML = '';

            filteredSounds.forEach(s => {
                if (cat === 'all' || s.category === cat) {
                    const item = document.createElement('div');
                    item.classList.add('audio-item');
                    item.dataset.sound = s.title;
                    item.innerHTML = `<span class="audio-item-title">${s.title}</span>`;
                    listContainer.appendChild(item);

                    item.addEventListener('click', () => openSoundPlayer(s.title));
                }
            });
        });
    });

    playerWindow.querySelectorAll('.audio-item').forEach(item => {
        const soundName = item.dataset.sound;
        item.addEventListener('click', () => openSoundPlayer(soundName));
    });

    makeDraggableList(playerWindow);
    makeResizableList(playerWindow);
}

function openSoundPlayer(soundName) {
    const existing = document.querySelector('.audio-sound-window');
    if (existing) existing.remove();

    const soundData = sounds[soundName];
    if (!soundData) {
        alert(`Не знайдено звуків з назвою ${soundName}`);
        return;
    }

    const playerWindow = document.createElement('div');
    playerWindow.classList.add('audio-sound-window');
    playerWindow.innerHTML = `
        <div class="audio-sound-header">
            <span class="audio-sound-title-header">${soundName}</span>
            <button class="audio-sound-close">✖</button>
        </div>
        <div class="audio-sound-body">
            <img src="${soundData.image}" alt="${soundData.title}" class="audio-sound-image">
            <p class="audio-sound-name">${soundData.title}</p>
            <p class="audio-sound-description">${soundData.description}</p>
            <audio id="audio-sound-player" src="${soundData.audio}"></audio>
            <div class="audio-sound-controls">
                <button class="audio-sound-play-btn" id="audio-sound-play-btn">▶</button>
                <div class="audio-sound-progress-container">
                    <div class="audio-sound-progress-bar" id="audio-sound-progress-bar"></div>
                </div>
                <span class="audio-sound-time">
                    <span id="audio-sound-current-time">0:00</span> / <span id="audio-sound-duration">0:00</span>
                </span>
            </div>
        </div>
        <div class="audio-sound-resizer"></div>
    `;

    document.body.appendChild(playerWindow);

    const audio = playerWindow.querySelector('#audio-sound-player');
    const playBtn = playerWindow.querySelector('#audio-sound-play-btn');
    const progressBar = playerWindow.querySelector('#audio-sound-progress-bar');
    const progressContainer = playerWindow.querySelector('.audio-sound-progress-container');
    const currentTimeEl = playerWindow.querySelector('#audio-sound-current-time');
    const durationEl = playerWindow.querySelector('#audio-sound-duration');

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '⏸';
            startPlaybackAnimation();
        } else {
            audio.pause();
            playBtn.textContent = '▶';
            stopPlaybackAnimation();
        }
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = progress + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    playerWindow.querySelector('.audio-sound-close').onclick = () => {
        audio.pause();
        stopPlaybackAnimation();
        playerWindow.remove();
    };

    startPlaybackAnimation();
    makeDraggableAudio(playerWindow);
    makeResizableAudio(playerWindow);
}
function openMusicPlayer(cityName, playlistURL) {
    const existing = document.querySelector('.spotify-window');

    if (existing) existing.remove();
    stopPlaybackAnimation();

    if (!playlistURL) {
        alert(`Для "${cityName}" ще немає плейлиста`);
        return;
    }

    const playerWindow = document.createElement('div');
    playerWindow.classList.add('spotify-window');
    playerWindow.innerHTML = `
        <div class="spotify-header music-header">
            <span class="spotify-title">${cityName} - Музика</span>
            <button class="spotify-close">✖</button>
        </div>
        <iframe
            src="${playlistURL}"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
        </iframe>
    `;
    document.body.appendChild(playerWindow);

    playerWindow.querySelector('.spotify-close').onclick = () => {
        stopPlaybackAnimation();
        playerWindow.remove();
    };

    startPlaybackAnimation();
    makeDraggableSpotify(playerWindow);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function makeDraggableList(element) {
    const header = element.querySelector('.audio-header');
    if (!header) return;

    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'grab';
    });
}
function makeResizableList(element) {
    const resizer = element.querySelector('.audio-resizer');
    if (!resizer) return;

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        element.style.width = `${startWidth + dx}px`;
        element.style.height = `${startHeight + dy}px`;
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.userSelect = '';
    });
}
function makeDraggableAudio(element) {
    const header = element.querySelector('.audio-sound-header');
    if (!header) return;

    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'grab';
    });
}
function makeResizableAudio(element) {
    const resizer = element.querySelector('.audio-sound-resizer');
    if (!resizer) return;

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        element.style.width = `${startWidth + dx}px`;
        element.style.height = `${startHeight + dy}px`;
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.userSelect = '';
    });
}
function makeDraggableSpotify(element) {
    const header = element.querySelector('.spotify-header');
    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'grab';
    });
}

function startPlaybackAnimation() {
    if (!lastClickedRegion) return;

    stopPlaybackAnimation();
    currentlyPlaying = true;

    const startRadius = 5000;
    const endRadius = 100000;
    const duration = 2000;
    const waveDelay = 700;

    const colorSettings = {
        music: { startColor: { r: 0, g: 145, b: 255 }, endColor: { r: 183, g: 214, b: 250 } },
        sounds: { startColor: { r: 75, g: 255, b: 45 }, endColor: { r: 181, g: 255, b: 171 } }
    };
    const modeSettings = colorSettings[currentMode] || colorSettings.sounds;

    function createWave() {
        if (!currentlyPlaying) return;

        const circle = L.circle([lastClickedRegion.lat, lastClickedRegion.lng], {
            radius: startRadius,
            color: `rgb(${modeSettings.startColor.r}, ${modeSettings.startColor.g}, ${modeSettings.startColor.b})`,
            fillColor: `rgb(${modeSettings.startColor.r}, ${modeSettings.startColor.g}, ${modeSettings.startColor.b})`,
            fillOpacity: 0.3,
            weight: 2
        }).addTo(map);

        const startTime = Date.now();

        function animate() {
            if (!currentlyPlaying) {
                map.removeLayer(circle);
                return;
            }

            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                map.removeLayer(circle);
                return;
            }

            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const radius = startRadius + (endRadius - startRadius) * eased;
            const r = Math.round(modeSettings.startColor.r + (modeSettings.endColor.r - modeSettings.startColor.r) * eased);
            const g = Math.round(modeSettings.startColor.g + (modeSettings.endColor.g - modeSettings.startColor.g) * eased);
            const b = Math.round(modeSettings.startColor.b + (modeSettings.endColor.b - modeSettings.startColor.b) * eased);
            const color = `rgb(${r}, ${g}, ${b})`;

            circle.setRadius(radius);
            circle.setStyle({ color, fillColor: color, fillOpacity: 0.3 - eased * 0.3 });

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

        // Наступне коло стартує через waveDelay, але тільки якщо анімація не зупинена
        if (currentlyPlaying) playbackTimeoutId = setTimeout(createWave, waveDelay);
    }

    createWave();
}
function stopPlaybackAnimation() {
    currentlyPlaying = false;
    if (playbackTimeoutId) {
        clearTimeout(playbackTimeoutId);
        playbackTimeoutId = null;
    }
    if (playbackCircle) {
        playbackCircle.forEach(circle => map.removeLayer(circle));
        playbackCircle = [];
    }
}