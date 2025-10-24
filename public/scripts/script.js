const btnSounds = document.getElementById("btn-sounds");
const btnMusic = document.getElementById("btn-music");
const btnGuides = document.getElementById("btn-guides");
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
    loginForm.classList.remove('hidden')
    registerForm.classList.add('hidden')
}
function showRegister() {
    tabRegister.classList.add('active')
    tabLogin.classList.remove('active')
    registerForm.classList.remove('hidden')
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
        // If the request fails (e.g., when running locally without a backend),
        // gracefully open the authentication dialog instead of doing nothing.
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


let currentMode = "music";

const map = L.map('map', {
    center: [49, 31],
    zoom: 6,
    zoomControl: true,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const cities = [
    { name: "Вінниця", coords: [49.2331, 28.4682] },
    { name: "Луцьк", coords: [50.7472, 25.3254] },
    { name: "Дніпро", coords: [48.4670, 35.0400] },
    { name: "Донецьк", coords: [48.0159, 37.8029] },
    { name: "Житомир", coords: [50.2547, 28.6587] },
    { name: "Ужгород", coords: [48.6208, 22.2879] },
    { name: "Запоріжжя", coords: [47.8388, 35.1396] },
    { name: "Івано-Франківськ", coords: [48.9226, 24.7111] },
    { name: "Київ", coords: [50.4501, 30.5234] },
    { name: "Кропивницький", coords: [48.5079, 32.2623] },
    { name: "Луганськ", coords: [48.5740, 39.3078] },
    { name: "Львів", coords: [49.8397, 24.0297] },
    { name: "Миколаїв", coords: [46.9750, 31.9946] },
    { name: "Одеса", coords: [46.4825, 30.7233] },
    { name: "Полтава", coords: [49.5883, 34.5514] },
    { name: "Рівне", coords: [50.6199, 26.2516] },
    { name: "Суми", coords: [50.9077, 34.7981] },
    { name: "Тернопіль", coords: [49.5535, 25.5948] },
    { name: "Харків", coords: [49.9935, 36.2304] },
    { name: "Херсон", coords: [46.6354, 32.6169] },
    { name: "Хмельницький", coords: [49.4210, 26.9871] },
    { name: "Черкаси", coords: [49.4444, 32.0598] },
    { name: "Чернівці", coords: [48.2915, 25.9403] },
    { name: "Чернігів", coords: [51.5055, 31.2849] },
    { name: "Сімферополь", coords: [44.95829, 34.11014] }
];

const playlists = {
    "Львів": "https://open.spotify.com/embed/playlist/37i9dQZF1DX7gIoKXt0gmx?utm_source=generator",
    "Луцьк": "https://open.spotify.com/embed/playlist/61OTpxcxvKcncbWYfxJG0h?utm_source=generator",
    "Ужгород": "https://open.spotify.com/embed/playlist/5oPgfiISFbOIleLgeKrANW?utm_source=generator",
    "Івано-Франківськ": "https://open.spotify.com/embed/playlist/4I20xi99T7YoYsApYZLzEx?utm_source=generator",
    "Тернопіль": "https://open.spotify.com/embed/playlist/5Mu8JspiNnrtZKBPBYHhkB?utm_source=generator",
    "Харків": "https://open.spotify.com/embed/playlist/2pOx55wWxI1vsLitqtpp60?utm_source=generator",
    "Луганськ": "https://open.spotify.com/embed/playlist/1pBcu7pquxneAFxcsmb671?utm_source=generator",
    "Донецьк": "https://open.spotify.com/embed/playlist/7sl24S6mRCO09MTXUmu2k3?utm_source=generator",
    "Запоріжжя": "https://open.spotify.com/embed/playlist/12ncb1YwgH2QGDr4id09lL?utm_source=generator",
    "Сімферополь": "https://open.spotify.com/embed/playlist/2Fy4rQtZt3M67paPLnBGDy?utm_source=generator",
    "Київ": "https://open.spotify.com/embed/playlist/5n8q1jMUZvukluXGrK59ud?utm_source=generator",
    "Житомир": "https://open.spotify.com/embed/playlist/6wY5dYvNyaZ6KDjYFxGjnA?utm_source=generator",
    "Чернівці": "https://open.spotify.com/embed/playlist/31ypb5JEcrvGlGFXtoyyAy?utm_source=generator",
    "Хмельницький": "https://open.spotify.com/embed/playlist/05j94JqODbqnK2bnhZmfB5?utm_source=generator",
    "Рівне": "https://open.spotify.com/embed/playlist/0Bht3kby2V9Q8BbDKe1kkY?utm_source=generator",
    "Херсон": "https://open.spotify.com/embed/playlist/2ByILCBJFvztz6715TMT4E?utm_source=generator",
    "Дніпро": "https://open.spotify.com/embed/playlist/6emNP4N4ikf3cfDhS8Q4hf?utm_source=generator",
    "Кропивницький": "https://open.spotify.com/embed/playlist/6hzjgiEvJjXi2Hnr3CocEm?utm_source=generator",
    "Одеса": "https://open.spotify.com/embed/playlist/2pVF5RrQw1DVwGIgPcMrXD?utm_source=generator",
    "Миколаїв": "https://open.spotify.com/embed/playlist/1FW6Fgxn3DXUOGfIIs834v?utm_source=generator",
    "Чернігів": "https://open.spotify.com/embed/playlist/63MRfNIjbDorHgfyPUqntF?utm_source=generator",
    "Суми": "https://open.spotify.com/embed/playlist/1754eV67gtIpKfmaubVDLj?utm_source=generator",
    "Полтава" : "https://open.spotify.com/embed/playlist/1m1P8XfkrnLtuJzTFfhwM4?utm_source=generator",
    "Черкаси": "https://open.spotify.com/embed/playlist/50ZfCmAEXHG55xGOiSnxyp?utm_source=generator",
    "Вінниця": "https://open.spotify.com/embed/playlist/4TPRVHImP6rdPbX8rZU3ES?utm_source=generator"
};

const soundPlaces = [
    { name: "Сіра ворона", coords: [50.4385, 30.5237] },
    { name: "Андріївський узвіз", coords: [50.4598, 30.5161]},
    { name: "Труханів острів", coords: [50.4640, 30.5451]},
    { name: "Вересень на Золотих воротах", coords: [50.4491, 30.5141]},
    { name: "Контрактова площа", coords: [50.4661, 30.5150]},
    { name: "Очеретянка велика", coords: [50.3794, 30.5190]},
    { name: "Вівчарик жовтобровий", coords: [50.3864, 30.5126]},
];

const sounds = {
    "Сіра ворона": {
        title: "Сіра ворона",
        description: "Вони надзвичайно розумні, соціальні, здатні використовувати знаряддя праці, розпізнавати людські обличчя та адаптуватися до міського життя. Її часто можна зустріти в містах та лісах, де вона відіграє важливу роль в екосистемі. Люблять розважатися, катаючись на снігу з дахів або граючись з іншими тваринами, наприклад собаками. Навіть після смерті одного з пари, інші ворони можуть збиратися біля загиблого птаха і видавати жалобні крики, що вказує на певний рівень емоційного зв'язку. Середня тривалість життя — 35–50 років.",
        image: "images/sira-vorona.jpg",
        audio: "sounds/sira-vorona.mp3",
        city: "Київ"
    },
    "Андріївський узвіз": {
        title: "Андріївський узвіз",
        description: "Історична вулиця-музей у Києві, відома як «київський Монмартр», яка з'єднує Верхнє місто з Подолом від Володимирської вулиці до Контрактової площі. Вулиця забудована переважно в XIX-XX століттях. Тут розташовані такі відомі будівлі, як Андріївська церква, Замок Річарда, Будинок-музей Михайла Булгакова (Будинок Турбіних) та Будинок-музей Івана Кавалерідзе. Тут встановлені пам'ятник героям п'єси «За двома зайцями» Проні Прокопівні та Свириду Голохвастову та пам'ятник Івану Кавалерідзе (у парку скульптур).",
        image: "images/andriivskiy-uzviz.jpg",
        audio: "sounds/andriivskiy-uzviz.mp3",
        city: "Київ"
    },
    "Труханів острів": {
        title: "Труханів острів",
        description: "Найбільший та один з найдавніших островів Києва на Дніпрі, що слугує популярною рекреаційною зоною. З'єднаний з правобережжям пішохідним мостом, острів пропонує безліч розваг: пляжі (зокрема Центральний), спортивні майданчики, пункти прокату, ресторани та зелені зони з унікальною рослинністю. Історично на острові існувало селище Водників, яке було знищене під час Другої світової війни, після чого територію облаштували для відпочинку.",
        image: "images/truhaniv-ostriv.jpg",
        audio: "sounds/truhaniv-ostriv.mp3",
        city: "Київ"
    },
    "Вересень на Золотих воротах": {
        title: "Вересень на Золотих воротах",
        description: "Головна брама стародавнього Києва, пам'ятка оборонної архітектури ХІ століття. Вона була побудована за часів Ярослава Мудрого як парадний в`їзд до міста, над якою височіла надбрамна церква Благовіщення. Сучасний вигляд пам`ятка отримала після реставрації, коли над залишками старовинних стін звели захисний павільйон, всередині якого розташований музей. Золоті ворота служили головним парадним в`їздом до Києва, куди прибували посли, купці та інші знатні особи. Архітектура Золотих воріт стала взірцем для інших споруд, зокрема для Троїцької надбрамної церкви Києво-Печерської лаври.",
        image: "images/veresen-na-zolotuh-vorotah.jpg",
        audio: "sounds/veresen-na-zolotuh-vorotah.mp3",
        city: "Київ"
    },
    "Контрактова площа": {
        title: "Контрактова площа",
        description: "Історичне серце Подолу, одна з найдавніших площ Києва, що існує з часів Київської Русі. Вона відома як торговий центр минулих століть, центр міжнародних «Контрактових ярмарків» наприкінці XVIII — початку ХІХ століття. У XVI столітті була відома як «Ринкова» через купців, які тримали тут комори. Після великої пожежі, що охопила весь Поділ, площа була відбудована за новим планом. Зараз це місце значної подій, де розташовано багато архітектурних пам'яток, таких як Гостиний двір, церква Різдва Христового та Києво-Могилянська академія.",
        image: "images/kontraktova-ploscha.jpg",
        audio: "sounds/kontraktova-ploscha.mp3",
        city: "Київ"
    },
    "Очеретянка велика": {
        title: "Очеретянка велика",
        description: "Найбільший птах з родини очеретянкових, розміром приблизно зі шпака, з бурим верхом тіла та білуватим низом, над оком має нечітку світлу «брову». Окрім комах, очеретянка може полювати на дрібних рибок (мальків) та пуголовків, спритно вихоплюючи їх з води. Самець може мати до трьох партнерок одночасно, приваблюючи їх своїм співом. Він допомагає вигодовувати пташенят першої самки, а інші самки справляються самі. Пташенята з'являються через 2 тижні. Через 11-12 днів вони вже не вміщаються в гнізді і сидять на його краю. Приблизно через 3 тижні після народження вони залишають гніздо.",
        image: "images/ocheretyanka-veluka.jpg",
        audio: "sounds/ocheretyanka-veluka.mp3",
        city: "Київ"
    },
    "Вівчарик жовтобровий": {
        title: "Вівчарик жовтобровий",
        description: "Невелика пташка довжиною близько 12 см і вагою 10-11 г, яка має зеленкувато-оливкове забарвлення зверху, широку жовту \"брову\" над оком і жовті горло, воло та груди. Пташка гніздиться в листяних і мішаних лісах, а на зиму відлітає до Африки. Вона відома своєю унікальною піснею, що складається з швидких свистячих складів та мелодійної трелі, а також тим, що будує кулясті гнізда на землі в густій траві.",
        image: "images/vivcharuk-zhovtobrovuy.jpg",
        audio: "sounds/vivcharuk-zhovtobrovuy.mp3",
        city: "Київ"
    }
};

const cityMarkers = [];
const soundMarkers = [];

cities.forEach(city => {
    const button = L.divIcon({
        className: 'city-icon',
        html: `<button class="city-button" data-city="${city.name}">${city.name}</button>`,
        iconSize: [80, 30],
        iconAnchor: [40, 15]
    });
    const marker = L.marker(city.coords, { icon: button }).addTo(map);
    cityMarkers.push({ marker, city: city.name });
    marker.on('click', () => handleCityClick(city.name));
});

soundPlaces.forEach(place => {
    const button = L.divIcon({
        className: 'sound-icon',
        html: `<button class="sound-button" data-sound="${place.name}">${place.name}</button>`,
        iconSize: [100, 30],
        iconAnchor: [50, 15]
    });
    const marker = L.marker(place.coords, { icon: button });
    soundMarkers.push({ marker, sound: place.name });
    marker.on('click', () => handleSoundClick(place.name));
});

function updateMarkersVisibility() {
    if (currentMode === 'music') {
        cityMarkers.forEach(item => {
            if (!map.hasLayer(item.marker)) item.marker.addTo(map);
        });
        soundMarkers.forEach(item => {
            if (map.hasLayer(item.marker)) map.removeLayer(item.marker);
        });
    } else if (currentMode === 'sounds') {
        soundMarkers.forEach(item => {
            if (!map.hasLayer(item.marker)) item.marker.addTo(map);
        });
        cityMarkers.forEach(item => {
            if (map.hasLayer(item.marker)) map.removeLayer(item.marker);
        });
    }
}

function setActive(button, mode) {
    [btnSounds, btnMusic, btnGuides].forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    currentMode = mode;
    updateButtonsMode();
    updateMarkersVisibility();
}

btnSounds.addEventListener("click", () => setActive(btnSounds, "sounds"));
btnMusic.addEventListener("click", () => setActive(btnMusic, "music"));
btnGuides.addEventListener("click", () => setActive(btnGuides, "guides"));

setActive(btnMusic, "music");

function updateButtonsMode() {
    document.querySelectorAll('.city-button, .sound-button').forEach(btn => {
        btn.classList.remove('music-mode', 'sounds-mode', 'guides-mode');
        btn.classList.add(`${currentMode}-mode`);
    });
}

function handleCityClick(cityName) {
    if (currentMode === "music") openMusicPlayer(cityName);
    else if (currentMode === "sounds") openSoundPlayer(cityName);
}

function handleSoundClick(soundName) {
    if (currentMode === "sounds") openSoundPlayer(soundName);
}

function openMusicPlayer(cityName) {
    const existing = document.querySelector('.spotify-window');
    if (existing) existing.remove();

    const playlistURL = playlists[cityName];
    if (!playlistURL) {
        alert(`Для міста "${cityName}" ще немає плейлиста`);
        return;
    }

    const playerWindow = document.createElement('div');
    playerWindow.classList.add('spotify-window');
    playerWindow.innerHTML = `
        <div class="spotify-header music-header">
            <span class="spotify-title">🎵 ${cityName} - Музика</span>
            <button class="spotify-close">✖</button>
        </div>
        <iframe
            src="${playlistURL}"
            width="500"
            height="480"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
        </iframe>
        <div class="spotify-resizer"></div>
    `;

    document.body.appendChild(playerWindow);

    playerWindow.querySelector('.spotify-close').onclick = () => playerWindow.remove();

    makeDraggable(playerWindow);
    makeResizable(playerWindow);
}

function openSoundPlayer(soundName) {
    const existing = document.querySelector('.audio-window');
    if (existing) existing.remove();

    const soundData = sounds[soundName];
    if (!soundData) {
        alert(`Не знайдено звуків з назвою ${soundName}`);
        return;
    }

    const playerWindow = document.createElement('div');
    playerWindow.classList.add('audio-window');
    playerWindow.innerHTML = `
        <div class="audio-header">
            <span class="audio-title-header">${soundName}</span>
            <button class="audio-close">✖</button>
        </div>
        <div class="audio-body">
            <img src="${soundData.image}" alt="${soundData.title}" class="audio-image">
            <p class="audio-name">${soundData.title}</p>
            <p class="audio-description">${soundData.description}</p>
            <audio id="audio-player" src="${soundData.audio}"></audio>
            <div class="audio-controls">
                <button class="audio-play-btn" id="audio-play-btn">▶</button>
                <div class="audio-progress-container">
                    <div class="audio-progress-bar" id="audio-progress-bar"></div>
                </div>
                <span class="audio-time">
                    <span id="audio-current-time">0:00</span> / <span id="audio-duration">0:00</span>
                </span>
            </div>
        </div>
        <div class="audio-resizer"></div>
    `;

    document.body.appendChild(playerWindow);

    const audio = playerWindow.querySelector('#audio-player');
    const playBtn = playerWindow.querySelector('#audio-play-btn');
    const progressBar = playerWindow.querySelector('#audio-progress-bar');
    const progressContainer = playerWindow.querySelector('.audio-progress-container');
    const currentTimeEl = playerWindow.querySelector('#audio-current-time');
    const durationEl = playerWindow.querySelector('#audio-duration');

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '⏸';
        } else {
            audio.pause();
            playBtn.textContent = '▶';
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

    playerWindow.querySelector('.audio-close').onclick = () => {
        audio.pause();
        playerWindow.remove();
    };

    makeDraggableAudio(playerWindow);
    makeResizableAudio(playerWindow);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function makeDraggableAudio(element) {
    const header = element.querySelector('.audio-header');
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
    const resizer = element.querySelector('.audio-resizer');
    let isResizing = false, startY = 0, startHeight = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = parseInt(getComputedStyle(element).height, 10);
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const newHeight = startHeight + (e.clientY - startY);
        element.style.height = `${Math.max(300, newHeight)}px`;
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.userSelect = '';
    });
}
function makeDraggable(element) {
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

function makeResizable(element) {
    const resizer = element.querySelector('.spotify-resizer');
    let isResizing = false, startY = 0, startHeight = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const newHeight = startHeight + (e.clientY - startY);
        element.style.height = `${Math.max(200, newHeight)}px`;
        const iframe = element.querySelector('iframe');
        if (iframe) {
            iframe.style.height = `${Math.max(160, newHeight - 40)}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.userSelect = '';
    });
}