const verbs = [
'make','say','get','know','think','see','want','use','find','tell',
'ask','feel','try','leave','put','mean','keep','let','begin','seem',
'show','hear','play','move','live','believe','bring','happen','call','need'
];
const pad = (n) => String(n).padStart(2, '0');
const ASSET_V = '20260910b';
const front = (i) => `assets/front/${pad(i + 1)}.png?v=${ASSET_V}`;
const audioSrc = (i) => `assets/audio/${verbs[i].replace(/\s+/g, '-')}.mp3`;
const KEY = 'verbs2A12v1';
function loadState() {
try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
catch { return {}; }
}
function save() {
try { localStorage.setItem(KEY, JSON.stringify(state)); }
catch { }
}
const state = loadState();
function shuffle(arr) {
const a = arr.slice();
for (let i = a.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[a[i], a[j]] = [a[j], a[i]];
}
return a;
}
let order = verbs.map((_, i) => i);
let card = 0;
let flipped = false;
const btnAudio = document.getElementById('btnAudio');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const player = new Audio();
player.preload = 'none';
function setAudioUI(playing) {
btnAudio.classList.toggle('playing', playing);
iconPlay.hidden = playing;
iconPause.hidden = !playing;
btnAudio.setAttribute('aria-label', playing ? 'Stop audio' : 'Play verb audio');
btnAudio.title = playing ? 'Stop' : 'Play pronunciation';
}
function stopAudio() {
player.pause();
player.currentTime = 0;
setAudioUI(false);
}
function playAudioForCurrent() {
btnAudio.classList.add('missing');
btnAudio.hidden = true;
setAudioUI(false);
}
function toggleAudio(e) {
if (e) {
e.stopPropagation();
e.preventDefault();
}
}
player.addEventListener('ended', () => setAudioUI(false));
player.addEventListener('error', () => {
btnAudio.classList.add('missing');
setAudioUI(false);
});
btnAudio.addEventListener('click', toggleAudio);
function show() {
stopAudio();
const i = order[card];
document.getElementById('frontImg').src = front(i);
document.getElementById('frontImg').alt = verbs[i];
document.getElementById('backImg').src = `assets/back/${pad(i + 1)}.png?v=${ASSET_V}`;
document.getElementById('backImg').alt = verbs[i];
document.getElementById('verbName').textContent = verbs[i].toUpperCase();
document.getElementById('counter').textContent = `${card + 1} / ${verbs.length}`;
document.getElementById('flipCard').classList.toggle('is-flipped', flipped);
btnAudio.classList.add('missing');
btnAudio.hidden = true;
}
function flip() {
flipped = !flipped;
show();
}
function goPrev() {
card = (card - 1 + verbs.length) % verbs.length;
show();
}
function goNext() {
card = (card + 1) % verbs.length;
show();
}
function isTypingTarget(el) {
if (!el || el === document.body) return false;
const tag = (el.tagName || '').toLowerCase();
return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}
document.getElementById('flipCard').addEventListener('click', (e) => {
if (e.target.closest('#btnAudio')) return;
flip();
});
document.getElementById('flipCard').addEventListener('keydown', (e) => {
if (e.target.closest('#btnAudio')) return;
if (e.key === 'Enter') { e.preventDefault(); flip(); }
});
document.getElementById('btnFlip').addEventListener('click', (e) => { e.stopPropagation(); flip(); });
document.getElementById('btnPrev').addEventListener('click', goPrev);
document.getElementById('btnNext').addEventListener('click', goNext);
document.addEventListener('keydown', (e) => {
if (isTypingTarget(e.target)) return;
if (e.metaKey || e.ctrlKey || e.altKey) return;
if (!document.getElementById('act-deck').open) return;
if (e.code === 'ArrowRight') {
e.preventDefault();
goNext();
} else if (e.code === 'ArrowLeft') {
e.preventDefault();
goPrev();
} else if (e.code === 'Space') {
e.preventDefault();
flip();
}
});
document.getElementById('btnShuffle').addEventListener('click', () => {
order = shuffle(order);
card = 0;
show();
});
document.getElementById('btnReset').addEventListener('click', () => {
order = verbs.map((_, i) => i);
card = 0;
flipped = false;
show();
});
show();
let nameSet = [];
let nameQ = 0;
let nameScore = 0;
let nameLocked = false;
function startName() {
nameSet = shuffle(verbs.map((_, i) => i)).slice(0, 10);
nameQ = 0;
nameScore = 0;
nameLocked = false;
document.getElementById('namePlay').hidden = false;
document.getElementById('nameDone').hidden = true;
document.getElementById('nameScore').textContent = '0';
showName();
}
function showName() {
if (nameQ >= nameSet.length) {
document.getElementById('namePlay').hidden = true;
document.getElementById('nameDone').hidden = false;
return;
}
nameLocked = false;
const i = nameSet[nameQ];
document.getElementById('nameRound').textContent = `${nameQ + 1} / ${nameSet.length}`;
document.getElementById('nameImg').src = front(i);
document.getElementById('nameImg').alt = 'What verb is this?';
document.getElementById('nameFb').textContent = '';
const others = shuffle(verbs.map((_, n) => n).filter((n) => n !== i)).slice(0, 3);
const opts = shuffle([i, ...others]);
document.getElementById('nameOpts').innerHTML = opts.map((n) =>
`<button type="button" class="opt" data-v="${n}">${verbs[n]}</button>`
).join('');
document.querySelectorAll('#nameOpts .opt').forEach((btn) => {
btn.addEventListener('click', () => {
if (nameLocked) return;
nameLocked = true;
const pick = Number(btn.dataset.v);
document.querySelectorAll('#nameOpts .opt').forEach((o) => {
if (Number(o.dataset.v) === i) o.classList.add('correct');
else if (o === btn) o.classList.add('wrong');
});
if (pick === i) {
nameScore += 1;
document.getElementById('nameFb').textContent = 'Yes — ' + verbs[i] + '.';
} else {
document.getElementById('nameFb').textContent = 'This photo is ' + verbs[i] + '.';
}
document.getElementById('nameScore').textContent = String(nameScore);
setTimeout(() => { nameQ += 1; showName(); }, 850);
});
});
}
document.getElementById('btnNameNew').addEventListener('click', startName);
const SPEED_MS = 45000;
let speedRunning = false;
let speedLocked = false;
let speedScore = 0;
let speedCurrent = -1;
let speedQueue = [];
let speedEndsAt = 0;
let speedTick = null;
let speedNextTimer = null;
function formatTime(ms) {
const s = Math.max(0, Math.ceil(ms / 1000));
return '0:' + String(s).padStart(2, '0');
}
function showSpeedBest() {
document.getElementById('speedBest').textContent = String(state.speedBest || 0);
}
function setSpeedView(view) {
document.getElementById('speedIdle').hidden = view !== 'idle';
document.getElementById('speedPlay').hidden = view !== 'play';
document.getElementById('speedDone').hidden = view !== 'done';
}
function clearSpeedTimers() {
if (speedTick) { clearInterval(speedTick); speedTick = null; }
if (speedNextTimer) { clearTimeout(speedNextTimer); speedNextTimer = null; }
}
function paintSpeedClock() {
const left = speedRunning ? Math.max(0, speedEndsAt - Date.now()) : SPEED_MS;
const el = document.getElementById('speedTime');
const stat = document.getElementById('speedTimeStat');
el.textContent = formatTime(speedRunning ? left : SPEED_MS);
stat.classList.toggle('low', speedRunning && left <= 10000 && left > 0);
}
function speedFinish() {
if (!speedRunning) return;
speedRunning = false;
speedLocked = true;
clearSpeedTimers();
paintSpeedClock();
document.getElementById('speedTime').textContent = '0:00';
document.getElementById('speedTimeStat').classList.remove('low');
const prevBest = state.speedBest || 0;
if (speedScore > prevBest) {
state.speedBest = speedScore;
save();
}
showSpeedBest();
document.getElementById('speedFinal').textContent = speedScore + ' in 45 seconds';
document.getElementById('speedHint').textContent = speedScore > prevBest
? 'New best. Press Play again to go higher.'
: 'Press Play again to beat your score.';
setSpeedView('done');
}
function speedShowPhoto() {
if (!speedRunning) return;
speedLocked = false;
if (!speedQueue.length) speedQueue = shuffle(verbs.map((_, i) => i));
if (speedQueue[0] === speedCurrent && speedQueue.length > 1) {
speedQueue.push(speedQueue.shift());
}
const i = speedQueue.shift();
speedCurrent = i;
document.getElementById('speedImg').src = front(i);
document.getElementById('speedImg').alt = 'What verb is this?';
document.getElementById('speedFb').textContent = '';
const others = shuffle(verbs.map((_, n) => n).filter((n) => n !== i)).slice(0, 3);
const opts = shuffle([i, ...others]);
document.getElementById('speedOpts').innerHTML = opts.map((n) =>
`<button type="button" class="opt" data-v="${n}">${verbs[n]}</button>`
).join('');
document.querySelectorAll('#speedOpts .opt').forEach((btn) => {
btn.addEventListener('click', () => {
if (!speedRunning || speedLocked) return;
speedLocked = true;
const pick = Number(btn.dataset.v);
document.querySelectorAll('#speedOpts .opt').forEach((o) => {
if (Number(o.dataset.v) === i) o.classList.add('correct');
else if (o === btn) o.classList.add('wrong');
});
if (pick === i) {
speedScore += 1;
document.getElementById('speedScore').textContent = String(speedScore);
document.getElementById('speedFb').textContent = 'Yes.';
} else {
document.getElementById('speedFb').textContent = verbs[i] + '.';
}
speedNextTimer = setTimeout(speedShowPhoto, pick === i ? 280 : 520);
});
});
}
function speedStart() {
clearSpeedTimers();
speedRunning = true;
speedLocked = false;
speedScore = 0;
speedCurrent = -1;
speedQueue = shuffle(verbs.map((_, i) => i));
speedEndsAt = Date.now() + SPEED_MS;
document.getElementById('speedScore').textContent = '0';
showSpeedBest();
setSpeedView('play');
paintSpeedClock();
speedTick = setInterval(() => {
paintSpeedClock();
if (Date.now() >= speedEndsAt) speedFinish();
}, 100);
speedShowPhoto();
}
document.getElementById('btnSpeedStart').addEventListener('click', speedStart);
document.getElementById('btnSpeedAgain').addEventListener('click', speedStart);
showSpeedBest();
paintSpeedClock();
setSpeedView('idle');
