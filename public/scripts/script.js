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
    { name: "Сіра ворона", coords: [50.43854648591285, 30.52373061026226] },
    { name: "Андріївський узвіз", coords: [50.45988883373832, 30.516182711986733]},
    { name: "Труханів острів", coords: [50.46406959471843, 30.545128793981252]},
    { name: "Вересень на Золотих воротах", coords: [50.44910872414411, 30.5141719837257]},
    { name: "Контрактова площа", coords: [50.46616715421915, 30.515035299505687]},
    { name: "Очеретянка велика", coords: [50.37942906898041, 30.519016197770426]},
    { name: "Вівчарик жовтобровий", coords: [50.38649422342252, 30.512650495483577]},
    { name: "Гімн Київського політехнічного інституту", coords: [50.44895885739085, 30.45693408130194]},
    { name: "Дзвони Софії Київської", coords: [50.45298414570137, 30.51434297150585]},
    { name: "Гімн \"Динамо\" Київ", coords: [50.45091416606141, 30.535384588696104]},
    { name: "Гімн Києво-Могилянської академії", coords: [50.4677846977162, 30.524459234723384]},
    { name: "Уривок із пʼєси \"Кайдашева сімʼя\"", coords: [50.4459628853084, 30.528449302189287]},
    { name: "Станція метро Академмістечко", coords: [50.46508098969801, 30.355085368395226]},
    { name: "Київ-Пасажирський", coords: [50.44059469798459, 30.489414412568255]},
    { name: "Київська кільцева електричка", coords: [50.44204957539558, 30.48943202234873]},
    { name: "Київський травмай", coords: [50.44679756128841, 30.490452644243383]},
    { name: "Пісні на Київському вокзалі", coords: [50.44172244278844, 30.48771530190787]},
    { name: "Київські Тролейбуси", coords: [50.44269284960104, 30.44252657511417]},
    //{ name: "", coords: []},

];

const sounds = {
    "Сіра ворона": {
        title: "Сіра ворона",
        description: "Вони надзвичайно розумні, соціальні, здатні використовувати знаряддя праці, розпізнавати людські обличчя та адаптуватися до міського життя. Її часто можна зустріти в містах та лісах, де вона відіграє важливу роль в екосистемі. Люблять розважатися, катаючись на снігу з дахів або граючись з іншими тваринами, наприклад собаками. Навіть після смерті одного з пари, інші ворони можуть збиратися біля загиблого птаха і видавати жалобні крики, що вказує на певний рівень емоційного звʼязку. Середня тривалість життя — 35–50 років.",
        image: "images/photos/sira-vorona.jpg",
        audio: "sounds/modeSounds/sira-vorona.mp3",
        city: "Київ"
    },
    "Андріївський узвіз": {
        title: "Андріївський узвіз",
        description: "Історична вулиця-музей у Києві, відома як «київський Монмартр», яка зʼєднує Верхнє місто з Подолом від Володимирської вулиці до Контрактової площі. Вулиця забудована переважно в XIX-XX століттях. Тут розташовані такі відомі будівлі, як Андріївська церква, Замок Річарда, Будинок-музей Михайла Булгакова (Будинок Турбіних) та Будинок-музей Івана Кавалерідзе. Тут встановлені памʼятник героям пʼєси «За двома зайцями» Проні Прокопівні та Свириду Голохвастову та памʼятник Івану Кавалерідзе (у парку скульптур).",
        image: "images/photos/andriivskiy-uzviz.jpg",
        audio: "sounds/modeSounds/andriivskiy-uzviz.mp3",
        city: "Київ"
    },
    "Труханів острів": {
        title: "Труханів острів",
        description: "Найбільший та один з найдавніших островів Києва на Дніпрі, що слугує популярною рекреаційною зоною. Зʼєднаний з правобережжям пішохідним мостом, острів пропонує безліч розваг: пляжі (зокрема Центральний), спортивні майданчики, пункти прокату, ресторани та зелені зони з унікальною рослинністю. Історично на острові існувало селище Водників, яке було знищене під час Другої світової війни, після чого територію облаштували для відпочинку.",
        image: "images/photos/truhaniv-ostriv.jpg",
        audio: "sounds/modeSounds/truhaniv-ostriv.mp3",
        city: "Київ"
    },
    "Вересень на Золотих воротах": {
        title: "Вересень на Золотих воротах",
        description: "Головна брама стародавнього Києва, памʼятка оборонної архітектури ХІ століття. Вона була побудована за часів Ярослава Мудрого як парадний вʼїзд до міста, над якою височіла надбрамна церква Благовіщення. Сучасний вигляд памʼятка отримала після реставрації, коли над залишками старовинних стін звели захисний павільйон, всередині якого розташований музей. Золоті ворота служили головним парадним вʼїздом до Києва, куди прибували посли, купці та інші знатні особи. Архітектура Золотих воріт стала взірцем для інших споруд, зокрема для Троїцької надбрамної церкви Києво-Печерської лаври.",
        image: "images/photos/veresen-na-zolotuh-vorotah.jpg",
        audio: "sounds/modeSounds/veresen-na-zolotuh-vorotah.mp3",
        city: "Київ"
    },
    "Контрактова площа": {
        title: "Контрактова площа",
        description: "Історичне серце Подолу, одна з найдавніших площ Києва, що існує з часів Київської Русі. Вона відома як торговий центр минулих століть, центр міжнародних «Контрактових ярмарків» наприкінці XVIII — початку ХІХ століття. У XVI столітті була відома як «Ринкова» через купців, які тримали тут комори. Після великої пожежі, що охопила весь Поділ, площа була відбудована за новим планом. \n" + "Зараз це місце значної подій, де розташовано багато архітектурних памʼяток, таких як Гостиний двір, церква Різдва Христового та Києво-Могилянська академія.",
        image: "images/photos/kontraktova-ploscha.jpg",
        audio: "sounds/modeSounds/kontraktova-ploscha.mp3",
        city: "Київ"
    },
    "Очеретянка велика": {
        title: "Очеретянка велика",
        description: "Найбільший птах з родини очеретянкових, розміром приблизно зі шпака, з бурим верхом тіла та білуватим низом, над оком має нечітку світлу «брову». Окрім комах, очеретянка може полювати на дрібних рибок (мальків) та пуголовків, спритно вихоплюючи їх з води. Самець може мати до трьох партнерок одночасно, приваблюючи їх своїм співом. Він допомагає вигодовувати пташенят першої самки, а інші самки справляються самі. Пташенята зʼявляються через 2 тижні. Через 11-12 днів вони вже не вміщаються в гнізді і сидять на його краю. Приблизно через 3 тижні після народження вони залишають гніздо.",
        image: "images/photos/ocheretyanka-veluka.jpg",
        audio: "sounds/modeSounds/ocheretyanka-veluka.mp3",
        city: "Київ"
    },
    "Вівчарик жовтобровий": {
        title: "Вівчарик жовтобровий",
        description: "Невелика пташка довжиною близько 12 см і вагою 10-11 г, яка має зеленкувато-оливкове забарвлення зверху, широку жовту \"брову\" над оком і жовті горло, воло та груди. Пташка гніздиться в листяних і мішаних лісах, а на зиму відлітає до Африки. Вона відома своєю унікальною піснею, що складається з швидких свистячих складів та мелодійної трелі, а також тим, що будує кулясті гнізда на землі в густій траві.",
        image: "images/photos/vivcharuk-zhovtobrovuy.jpg",
        audio: "sounds/modeSounds/vivcharuk-zhovtobrovuy.mp3",
        city: "Київ"
    },
    "Гімн Київського політехнічного інституту": {
        title: "Гімн Київського політехнічного інституту",
        description: "Найбільший навчально-науковий центр України, заснований у 1898 році як Київський політехнічний інститут. Здійснює підготовку бакалаврів, магістрів, докторів філософії (PhD) та докторів наук. Включає 14 факультетів, 10 навчально-наукових інститутів, науково-дослідні інститути та наукові центри. \n" + "Цікаві факти: на території університету є найстаріше дерево Києва — райська яблуня, яка має статус найстаршого дерева столиці, а парк КПІ формувався завдяки роботам першого опікуна парку, вченого-садівника Е. І. Блекте.",
        image: "images/photos/gimn-kpi.jpg",
        audio: "sounds/modeSounds/gimn-kpi.mp3",
        city: "Київ"
    },
    "Дзвони Софії Київської": {
        title: "Дзвони Софії Київської",
        description: "Унікальний історичний та архітектурний комплекс XI—XVIII століть, що поєднує візантійський стиль з українським бароко, який є одним із найдавніших храмів Києва і внесений до списку Всесвітньої спадщини ЮНЕСКО. Слово \"Софія\" походить з грецької мови і означає \"мудрість\". Назва собору, на думку творців, мала утверджувати християнство на Русі. Собор відомий своїми вражаючими мозаїками та фресками, зокрема мозаїкою \"Оранта\", та унікальним некрополем з саркофагами видатних князів, таких як Ярослав Мудрий та Володимир Мономах.",
        image: "images/photos/sofia-bells.jpg",
        audio: "sounds/modeSounds/sofia-bells.mp3",
        city: "Київ"
    },
    "Гімн \"Динамо\" Київ": {
        title: "Гімн \"Динамо\" Київ",
        description: "Стадіон «Динамо» імені Валерія Лобановського – це домашня арена ФК «Динамо» (Київ), розташована в центрі міста поблизу Майдану Незалежності. Він вміщує 16 873 глядачі та є памʼяткою архітектури місцевого значення. Цікаві факти про стадіон включають його будівництво на місці теплиць, наявність памʼятника Валерію Лобановському, а також той факт, що до 2001 року тут функціонував відкритий басейн. На території встановлено памʼятник чотирьом футболістам київського «Динамо», які загинули під час Другої світової війни.",
        image: "images/photos/gimn-dynamo.jpg",
        audio: "sounds/modeSounds/gimn-dynamo.mp3",
        city: "Київ"
    },
    "Гімн Києво-Могилянської академії": {
        title: "Гімн Києво-Могилянської академії",
        description: "Один з найстаріших українських вишів, заснований у 1632 році шляхом обʼєднання Київської братської та Лаврської шкіл. За час свого існування вона була провідним освітнім та культурним центром, надаючи освіту у багатьох дисциплінах і готуючи видатних діячів. Навчання велося латиною, а програма була надзвичайно широкою і включала, крім богословʼя та філософії, багато інших дисциплін, таких як математика, музика, медицина та іноземні мови. Була закрита у 1817 році. Після століття існування в будівлях (за часів СРСР) військово-морського училища, у 1991 році діяльність академії було відновлено як Національного університету «Києво-Могилянська академія». Перші студенти відродженої «Могилянки» почали навчання 24 серпня 1992 року.",
        image: "images/photos/gimn-mogulyanka.jpg",
        audio: "sounds/modeSounds/gimn-mogulyanka.mp3",
        city: "Київ"
    },
    "Уривок із пʼєси \"Кайдашева сімʼя\"": {
        title: "Уривок із пʼєси \"Кайдашева сімʼя\"",
        description: "Провідний театр України, заснований у 1920 році, який працює у Києві в історичній будівлі, зведеній у 1898 році для театру «Соловцов». Під театром збереглося джерело, яке колись було частиною ставу в садибі професора Мерінга. Будівля театру розташована на місці ставу, який належав садибі професора Федора Мерінга. Взимку його використовували як ковзанку, а нащадки професора продали землю під забудову. Вода з нього вважається цілющою і приносить удачу, а у важкі часи війни вона рятувала життя. За часів режисерства Богдана Ступки театр активно гастролював за кордоном, зокрема в Німеччині, Австрії, Греції, Італії та Польщі. Статус національного театру він отримав у 1994 році.",
        image: "images/photos/teatr-kaydash.jpg",
        audio: "sounds/modeSounds/teatr-kaydash.mp3",
        city: "Київ"
    },
    "Станція метро Академмістечко": {
        title: "Станція метро Академмістечко",
        description: "Західна кінцева станція Червоної лінії Київського метрополітену. Вона відкрилася у 2003 році та названа на честь наукових та освітніх установ, що знаходяться неподалік.",
        image: "images/photos/akadem.jpg",
        audio: "sounds/modeSounds/akadem.mp3",
        city: "Київ"
    },
    "Київ-Пасажирський": {
        title: "Київ-Пасажирський",
        description: "Центральний залізничний вокзал Києва був збудований у 1868 р., після чого неодноразово був реставрований, останнє масштабне оновлення будівлі вокзалу здійснилося у 2001 р., тоді і було збудовано Південний вокзал як розвантаження Центрального. Будинок київського залізничного вокзалу має дуже велику історичну цінність для країни. Воно було реконструйовано за проектом архітектора Олександра Вербицького та виконано у стилі необарокко та конструктивізму.",
        image: "images/photos/vokzal-potyag.jpg",
        audio: "sounds/modeSounds/vokzal-potyag.mp3",
        city: "Київ"
    },
    "Київська кільцева електричка": {
        title: "Київська кільцева електричка",
        description: "Рух відкрито 2 вересня 2009. Проєкт «Міська електричка» був реалізований з метою організації рівномірного розподілу пасажиропотоків та зменшення навантаження на інший громадський транспорт столиці, а також для забезпечення прямого звʼязку між лівобережною та правобережною частинами міста Києва.",
        image: "images/photos/potyag.jpg",
        audio: "sounds/modeSounds/potyag.mp3",
        city: "Київ"
    },
    "Київський травмай": {
        title: "Київський травмай",
        description: "Система електричного трамвая міста Києва, відкрита 1 червня 1892 року, перша електрична трамвайна мережа на території колишньої Російської імперії, перша на території сучасної України, третя в Східній Європі (після Будапешта (1888) і Праги (1891)), шістнадцята в Європі. Також саме в Києві 30 грудня 1978 стала до ладу перша в тодішньому Радянському Союзі лінія швидкісного трамвая.",
        image: "images/photos/tram.jpg",
        audio: "sounds/modeSounds/tram.mp3",
        city: "Київ"
    },
    "Пісні на Київському вокзалі": {
        title: "Пісні на Київському вокзалі",
        description: "На Київському вокзалі часто звучать патріотичні пісні, зокрема, оркестр виконував \"Воїни світла\" для військових. Також на вокзалі можна почути \"Як тебе не любити, Києве мій\", яка є офіційним гімном міста з листопада 2014 року.",
        image: "images/photos/vokzal.jpg",
        audio: "sounds/modeSounds/song-vokzal.mp3",
        city: "Київ"
    },
    "Київські Тролейбуси": {
        title: "Київські Тролейбуси",
        description: "Найбільша в Україні та одна з найбільших у світі, відкрита 5 листопада 1935 року. Вона експлуатує велику кількість машин і має найбільшу довжину ліній у країні. Крім пасажирських, у Києві також виробляли вантажні тролейбуси (КТГ), які використовувалися в багатьох містах пострадянського простору.",
        image: "images/photos/trolleybus.jpg",
        audio: "sounds/modeSounds/trolleybus.mp3",
        city: "Київ"
    },
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
    const icon = L.divIcon({
        className: 'sound-icon',
        html: `<img src="images/marker-sound.png" class="sound-marker" data-sound="${place.name}" style="width:40px; height:40px; cursor:pointer;">`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const marker = L.marker(place.coords, { icon: icon });
    soundMarkers.push({ marker, sound: place.name });

    marker.on('click', () => handleSoundClick(place.name));

    const symbolCount = place.name.length;
    const width = `${symbolCount * 8}px`;

    const label = L.divIcon({
        className: 'sound-label',
        html: `<span class="label-text">${place.name}</span>`,
        iconAnchor: [-20, 10]
    });
    const labelMarker = L.marker([place.coords[0], place.coords[1]], { icon: label });
    labelMarker.addTo(map);
    labelMarker.getElement().style.display = 'none';

    place._labelMarker = labelMarker;
});

function updateLabelsVisibility() {
    const zoom = map.getZoom();
    soundPlaces.forEach(place => {
        const labelMarker = place._labelMarker;
        if (!labelMarker) return;
        const el = labelMarker.getElement();
        if (!el) return;

        if (currentMode === 'sounds' && zoom >= 10) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

map.on('zoomend', () => {
    updateLabelsVisibility();
});

function setActive(button, mode) {
    [btnSounds, btnMusic, btnGuides].forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    currentMode = mode;
    updateButtonsMode();
    updateMarkersVisibility();

    updateLabelsVisibility();
}

/*soundPlaces.forEach(place => {
    const button = L.divIcon({
        className: 'sound-icon',
        html: `<button class="sound-button" data-sound="${place.name}">${place.name}</button>`,
        iconSize: [100, 30],
        iconAnchor: [50, 15]
    });
    const marker = L.marker(place.coords, { icon: button });
    soundMarkers.push({ marker, sound: place.name });
    marker.on('click', () => handleSoundClick(place.name));
});*/

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
            <span class="spotify-title">${cityName} - Музика</span>
            <button class="spotify-close">✖</button>
        </div>
        <iframe
            src="${playlistURL}"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
        </iframe>
        <div class="spotify-resizer"></div>
    `;
    document.body.appendChild(playerWindow);

    playerWindow.querySelector('.spotify-close').onclick = () => playerWindow.remove();

    makeDraggableSpotify(playerWindow);
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