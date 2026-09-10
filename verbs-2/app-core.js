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
  const i = order[card];
  const src = audioSrc(i);
  btnAudio.classList.remove('missing');
  btnAudio.hidden = false;
  btnAudio.disabled = false;
  btnAudio.removeAttribute('aria-hidden');
  btnAudio.title = 'Play pronunciation';
  btnAudio.setAttribute('aria-label', 'Play verb audio');
  if (player.src && player.src.endsWith(src.split('/').pop()) === false) { /* set below */ }
  player.src = src;
  player.play().then(() => setAudioUI(true)).catch(() => {
    btnAudio.classList.add('missing');
    setAudioUI(false);
  });
}
function toggleAudio(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  if (btnAudio.classList.contains('missing') || btnAudio.disabled) return;
  if (!player.paused && !player.ended) { stopAudio(); return; }
  playAudioForCurrent();
}
player.addEventListener('ended', () => setAudioUI(false));
player.addEventListener('error', () => {
btnAudio.classList.add('missing');
setAudioUI(false);
});
btnAudio.addEventListener('click', toggleAudio);
function show() {
const i = order[card];
document.getElementById('frontImg').src = front(i);
document.getElementById('frontImg').alt = verbs[i];
document.getElementById('backImg').src = `assets/back/${pad(i + 1)}.png?v=${ASSET_V}`;
document.getElementById('backImg').alt = verbs[i];
document.getElementById('verbName').textContent = verbs[i].toUpperCase();
document.getElementById('counter').textContent = `${card + 1} / ${verbs.length}`;
document.getElementById('flipCard').classList.toggle('is-flipped', flipped);
btnAudio.classList.remove('missing');
btnAudio.hidden = false;
btnAudio.disabled = false;
btnAudio.removeAttribute('aria-hidden');
stopAudio();
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
