const envelopeScene = document.getElementById('scene-envelope');
const inviteScene   = document.getElementById('scene-invite');
const gateScene     = document.getElementById('scene-gate');
const gameScene     = document.getElementById('scene-game');
const portfolio      = document.getElementById('portfolio');

const sealBtn     = document.getElementById('seal-btn');
const skipBtn     = document.getElementById('skip-intro');
const acceptBtn   = document.getElementById('btn-accept');
const declineBtn  = document.getElementById('btn-decline');
const declineMsg  = document.getElementById('decline-msg');

const menuBtn  = document.getElementById('btn-menu');
const startBtn = document.getElementById('btn-start');
const gateBox  = document.querySelector('.gate-box');

document.documentElement.classList.add('locked');

// ---------------- tiny synth sound engine (no audio files needed) ----------------
let audioCtx;
function ctx(){ audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function beep({freq = 440, dur = 0.12, type = 'square', glideTo = null, vol = 0.06}){
  try{
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, ac.currentTime + dur);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }catch(e){ /* audio not available, fail silently */ }
}
const sfx = {
  crack:   () => beep({freq: 220, glideTo: 60,  dur: 0.35, type: 'sawtooth', vol: 0.08}),
  whoosh:  () => beep({freq: 500, glideTo: 900, dur: 0.25, type: 'sine',     vol: 0.04}),
  accept:  () => { beep({freq: 440, dur: 0.1, type:'square'}); setTimeout(()=>beep({freq: 660, dur: 0.18, type:'square'}), 90); },
  decline: () => beep({freq: 140, dur: 0.2, type: 'sawtooth', vol: 0.05}),
  click:   () => beep({freq: 320, dur: 0.06, type: 'square', vol: 0.05}),
  catch:   () => beep({freq: 700 + Math.random()*300, dur: 0.09, type: 'triangle', vol: 0.06}),
  win:     () => { [523,659,784,1046].forEach((f,i)=> setTimeout(()=>beep({freq:f, dur:0.16, type:'square', vol:0.05}), i*90)); }
};

// ---- Scene 1 -> Scene 2: break the seal ----
function breakSeal(){
  if (envelopeScene.classList.contains('breaking')) return;
  envelopeScene.classList.add('breaking');
  sfx.crack();
  setTimeout(() => { envelopeScene.classList.add('leaving'); sfx.whoosh(); }, 500);
  setTimeout(() => {
    envelopeScene.style.display = 'none';
    inviteScene.setAttribute('aria-hidden', 'false');
    inviteScene.classList.add('show');
  }, 1100);
}
sealBtn.addEventListener('click', breakSeal);

skipBtn.addEventListener('click', enterPortfolio);

const declineLines = [
  "there isn't really a way out.",
  "you can try, but the invitation stays.",
  "okay, but you'll be back."
];
let declineTaps = 0;
declineBtn.addEventListener('click', () => {
  sfx.decline();
  declineMsg.textContent = declineLines[Math.min(declineTaps, declineLines.length - 1)];
  declineTaps++;
});

acceptBtn.addEventListener('click', () => {
  sfx.accept();
  inviteScene.classList.add('leaving');
  setTimeout(() => {
    inviteScene.classList.remove('show', 'leaving');
    inviteScene.style.display = 'none';
    gateScene.setAttribute('aria-hidden', 'false');
    gateScene.classList.add('show');
  }, 500);
});

function shakeGate(msg){
  document.getElementById('exit-msg').textContent = msg;
  gateBox.classList.remove('shake');
  void gateBox.offsetWidth;
  gateBox.classList.add('shake');
  sfx.decline();
}
menuBtn.addEventListener('click', () => shakeGate("menu's still being built — hit start for now."));
startBtn.addEventListener('click', () => {
  sfx.click();
  gateScene.classList.remove('show');
  gameScene.setAttribute('aria-hidden', 'false');
  gameScene.classList.add('show');
  startGame();
});

// ---------------- Scene 3b: catch-the-sparks mini game ----------------
const field    = document.getElementById('game-field');
const scoreEl  = document.getElementById('game-score');
const timeEl   = document.getElementById('game-time');
const endPanel = document.getElementById('game-end');
const endTitle = document.getElementById('game-end-title');
const continueBtn = document.getElementById('btn-continue');
const GLYPHS = ['✦','◆','★','✧'];

let score = 0, timeLeft = 15, spawnTimer = null, countdownTimer = null, gameOver = false;

function startGame(){
  score = 0; timeLeft = 15; gameOver = false;
  endPanel.hidden = true;
  field.innerHTML = '';
  scoreEl.textContent = 'SCORE 0';
  timeEl.textContent = '15s';

  spawnTimer = setInterval(spawnSpark, 550);
  countdownTimer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft + 's';
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function spawnSpark(){
  if (gameOver) return;
  const s = document.createElement('button');
  s.className = 'spark';
  s.type = 'button';
  s.textContent = GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
  s.style.left = (Math.random()*84 + 4) + '%';
  const dur = 2.6 + Math.random()*1.6;
  s.style.animationDuration = dur + 's';
  s.style.color = ['#e8c468','#a793cf','#6fb8b3','#d9a8c0'][Math.floor(Math.random()*4)];
  field.appendChild(s);

  s.addEventListener('click', () => {
    if (s.classList.contains('pop')) return;
    score++;
    scoreEl.textContent = 'SCORE ' + score;
    sfx.catch();
    s.classList.add('pop');
    setTimeout(() => s.remove(), 300);
  });
  s.addEventListener('animationend', () => { if (!s.classList.contains('pop')) s.remove(); });
}

function endGame(){
  gameOver = true;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  field.querySelectorAll('.spark').forEach(s => s.remove());
  endTitle.innerHTML = score >= 8 ? 'SHARP REFLEXES.<br>' + score + ' CAUGHT' : 'RUN COMPLETE.<br>' + score + ' CAUGHT';
  endPanel.hidden = false;
  sfx.win();
}
continueBtn.addEventListener('click', enterPortfolio);

// ---- final scene: the actual portfolio ----
function enterPortfolio(){
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  [envelopeScene, inviteScene, gateScene, gameScene].forEach(s => {
    s.style.display = 'none';
    s.classList.remove('show');
  });
  document.documentElement.classList.remove('locked');
  portfolio.setAttribute('aria-hidden', 'false');
  portfolio.classList.add('show');
  window.scrollTo(0, 0);
}