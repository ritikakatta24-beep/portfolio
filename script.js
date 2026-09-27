const envelopeScene = document.getElementById('scene-envelope');
const inviteScene   = document.getElementById('scene-invite');
const gateScene     = document.getElementById('scene-gate');
const portfolio      = document.getElementById('portfolio');

const sealBtn     = document.getElementById('seal-btn');
const skipBtn     = document.getElementById('skip-intro');
const acceptBtn   = document.getElementById('btn-accept');
const declineBtn  = document.getElementById('btn-decline');
const declineMsg  = document.getElementById('decline-msg');

const menuBtn  = document.getElementById('btn-menu');
const startBtn = document.getElementById('btn-start');
const exitBtn  = document.getElementById('btn-exit');
const exitMsg  = document.getElementById('exit-msg');
const gateBox  = document.querySelector('.gate-box');

document.documentElement.classList.add('locked');

function breakSeal(){
  if (envelopeScene.classList.contains('breaking')) return;
  envelopeScene.classList.add('breaking');
  setTimeout(() => envelopeScene.classList.add('leaving'), 500);
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
  declineMsg.textContent = declineLines[Math.min(declineTaps, declineLines.length - 1)];
  declineTaps++;
});

acceptBtn.addEventListener('click', () => {
  inviteScene.classList.add('leaving');
  setTimeout(() => {
    inviteScene.classList.remove('show', 'leaving');
    inviteScene.style.display = 'none';
    gateScene.setAttribute('aria-hidden', 'false');
    gateScene.classList.add('show');
  }, 500);
});

function shakeGate(msg){
  exitMsg.textContent = msg;
  gateBox.classList.remove('shake');
  void gateBox.offsetWidth;
  gateBox.classList.add('shake');
}
menuBtn.addEventListener('click', () => shakeGate("menu's still being built — hit start for now."));
startBtn.addEventListener('click', enterPortfolio);
exitBtn.addEventListener('click', enterPortfolio);

function enterPortfolio(){
  [envelopeScene, inviteScene, gateScene].forEach(s => {
    s.style.display = 'none';
    s.classList.remove('show');
  });
  document.documentElement.classList.remove('locked');
  portfolio.setAttribute('aria-hidden', 'false');
  portfolio.classList.add('show');
  window.scrollTo(0, 0);
}