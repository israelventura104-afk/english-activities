const binItems = [
{ i: 3, b: 'mind' }, { i: 4, b: 'mind' }, { i: 11, b: 'mind' }, { i: 25, b: 'mind' },
{ i: 1, b: 'talk' }, { i: 9, b: 'talk' }, { i: 10, b: 'talk' }, { i: 28, b: 'talk' },
{ i: 0, b: 'hands' }, { i: 14, b: 'hands' }, { i: 16, b: 'hands' }, { i: 26, b: 'hands' }
];
let binPlace = {};
let binPick = null;
function binReset() {
binPlace = {};
binPick = null;
document.getElementById('binFb').textContent = '';
document.querySelectorAll('.bin').forEach((el) => el.classList.remove('ok', 'bad'));
renderBins();
}
function renderBins() {
const pool = document.getElementById('binPool');
pool.innerHTML = '';
['mind', 'talk', 'hands'].forEach((b) => { document.getElementById('bin-' + b).innerHTML = ''; });
binItems.forEach((item) => {
const loc = binPlace[item.i] || 'pool';
const chip = document.createElement('button');
chip.type = 'button';
chip.className = 'chip' + (binPick === item.i ? ' on' : '');
chip.textContent = verbs[item.i];
chip.addEventListener('click', (e) => {
e.stopPropagation();
document.querySelectorAll('.bin').forEach((el) => el.classList.remove('ok', 'bad'));
document.getElementById('binFb').textContent = '';
if (binPick === item.i) binPick = null;
else binPick = item.i;
renderBins();
});
if (loc === 'pool') pool.appendChild(chip);
else document.getElementById('bin-' + loc).appendChild(chip);
});
}
document.querySelectorAll('.bin').forEach((bin) => {
bin.addEventListener('click', () => {
if (binPick == null) return;
binPlace[binPick] = bin.dataset.bin;
binPick = null;
renderBins();
});
});
document.getElementById('btnBinCheck').addEventListener('click', () => {
let right = 0;
document.querySelectorAll('.bin').forEach((el) => el.classList.remove('ok', 'bad'));
const miss = { mind: false, talk: false, hands: false };
binItems.forEach((item) => {
if (binPlace[item.i] === item.b) right += 1;
else miss[item.b] = true;
});
['mind', 'talk', 'hands'].forEach((b) => {
document.querySelector(`.bin[data-bin="${b}"]`).classList.add(miss[b] ? 'bad' : 'ok');
});
document.getElementById('binFb').textContent = right === binItems.length
? 'All twelve verbs are in the right group.'
: `${right} / 12. Mind = know, think, feel, believe. Talk = say, tell, ask, call. Hands = make, put, keep, bring.`;
});
document.getElementById('btnBinReset').addEventListener('click', binReset);
binReset();
const TYPE_MS = 45000;
let typeRunning = false;
let typeLocked = false;
let typeScore = 0;
let typeCurrent = -1;
let typeQueue = [];
let typeEndsAt = 0;
let typeTick = null;
let typeNextTimer = null;
function norm(s) {
return String(s).trim().toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
}
function showTypeBest() {
document.getElementById('typeBest').textContent = String(state.typeBest || 0);
}
function setTypeView(view) {
document.getElementById('typeIdle').hidden = view !== 'idle';
document.getElementById('typePlay').hidden = view !== 'play';
document.getElementById('typeDone').hidden = view !== 'done';
}
function clearTypeTimers() {
if (typeTick) { clearInterval(typeTick); typeTick = null; }
if (typeNextTimer) { clearTimeout(typeNextTimer); typeNextTimer = null; }
}
function paintTypeClock() {
const left = typeRunning ? Math.max(0, typeEndsAt - Date.now()) : TYPE_MS;
document.getElementById('typeTime').textContent = formatTime(typeRunning ? left : TYPE_MS);
document.getElementById('typeTimeStat').classList.toggle('low', typeRunning && left <= 10000 && left > 0);
}
function typeFinish() {
if (!typeRunning) return;
typeRunning = false;
typeLocked = true;
clearTypeTimers();
paintTypeClock();
document.getElementById('typeTime').textContent = '0:00';
document.getElementById('typeTimeStat').classList.remove('low');
const prevBest = state.typeBest || 0;
if (typeScore > prevBest) {
state.typeBest = typeScore;
save();
}
showTypeBest();
document.getElementById('typeFinal').textContent = typeScore + ' in 45 seconds';
document.getElementById('typeHint').textContent = typeScore > prevBest
? 'New best. Press Play again to go higher.'
: 'Press Play again to beat your score.';
setTypeView('done');
}
function typeShowPhoto() {
if (!typeRunning) return;
typeLocked = false;
if (!typeQueue.length) typeQueue = shuffle(verbs.map((_, i) => i));
if (typeQueue[0] === typeCurrent && typeQueue.length > 1) {
typeQueue.push(typeQueue.shift());
}
typeCurrent = typeQueue.shift();
document.getElementById('typeImg').src = front(typeCurrent);
document.getElementById('typeImg').alt = 'Type the verb for this photo';
document.getElementById('typeInput').value = '';
document.getElementById('typeFb').textContent = '';
document.getElementById('typeInput').focus();
}
function checkType() {
if (!typeRunning || typeLocked) return;
const i = typeCurrent;
const ok = norm(document.getElementById('typeInput').value) === norm(verbs[i]);
typeLocked = true;
if (ok) {
typeScore += 1;
document.getElementById('typeScore').textContent = String(typeScore);
document.getElementById('typeFb').textContent = 'Yes.';
} else {
document.getElementById('typeFb').textContent = 'The verb is ' + verbs[i] + '.';
}
typeNextTimer = setTimeout(typeShowPhoto, ok ? 280 : 700);
}
function typeStart() {
clearTypeTimers();
typeRunning = true;
typeLocked = false;
typeScore = 0;
typeCurrent = -1;
typeQueue = shuffle(verbs.map((_, i) => i));
typeEndsAt = Date.now() + TYPE_MS;
document.getElementById('typeScore').textContent = '0';
showTypeBest();
setTypeView('play');
paintTypeClock();
typeTick = setInterval(() => {
paintTypeClock();
if (Date.now() >= typeEndsAt) typeFinish();
}, 100);
typeShowPhoto();
}
document.getElementById('btnTypeCheck').addEventListener('click', checkType);
document.getElementById('typeInput').addEventListener('keydown', (e) => {
if (e.key === 'Enter') { e.preventDefault(); checkType(); }
});
document.getElementById('btnTypeStart').addEventListener('click', typeStart);
document.getElementById('btnTypeAgain').addEventListener('click', typeStart);
showTypeBest();
paintTypeClock();
setTypeView('idle');
let saySet = [];
let sayQ = 0;
let sayOpen = false;
function startSay() {
saySet = shuffle(verbs.map((_, i) => i)).slice(0, 8);
sayQ = 0;
sayOpen = false;
showSay();
}
function showSay() {
const i = saySet[sayQ];
document.getElementById('sayRound').textContent = `${sayQ + 1} / ${saySet.length}`;
document.getElementById('sayImg').src = front(i);
document.getElementById('sayImg').alt = 'Mime this verb';
document.getElementById('sayWord').textContent = sayOpen ? verbs[i].toUpperCase() : 'Mime the verb.';
document.getElementById('sayHint').textContent = sayOpen
? 'That was the verb. Next photo.'
: 'Look. Act it out. No talking. Then tap Reveal.';
}
document.getElementById('btnSayReveal').addEventListener('click', () => {
sayOpen = true;
showSay();
});
document.getElementById('btnSayNext').addEventListener('click', () => {
sayQ = (sayQ + 1) % saySet.length;
sayOpen = false;
showSay();
});
document.getElementById('btnSayNew').addEventListener('click', startSay);
const candoItems = [
['name', 'I can name these 30 high-frequency verbs from a photo.'],
['say', 'I can mime these verbs from a photo.'],
['speed', 'I can name verbs from a photo against the clock.'],
['group', 'I can group verbs: mind, talk, and hands.'],
['write', 'I can write the verb for a photo.']
];
function renderCando() {
const c = state.cando || {};
document.getElementById('candoList').innerHTML = candoItems.map(([id, label]) => `
<label>
<input type="checkbox" data-cando="${id}" ${c[id] ? 'checked' : ''}>
<span>${label}</span>
</label>
`).join('');
document.querySelectorAll('[data-cando]').forEach((el) => {
el.addEventListener('change', () => {
state.cando = state.cando || {};
state.cando[el.dataset.cando] = el.checked;
save();
});
});
}
renderCando();
const activityPanels = Array.from(document.querySelectorAll('.activity'));
activityPanels.forEach((panel) => {
panel.addEventListener('toggle', () => {
if (panel.id === 'act-speed' && !panel.open && speedRunning) speedFinish();
if (panel.id === 'act-type' && !panel.open && typeRunning) typeFinish();
if (!panel.open) return;
activityPanels.forEach((other) => { if (other !== panel) other.open = false; });
if (panel.id === 'act-name' && !nameSet.length) startName();
if (panel.id === 'act-say' && !saySet.length) startSay();
});
});
startName();
startSay();
