const welcome = document.getElementById('welcome');
const invite = document.getElementById('invite');
const openInvite = document.getElementById('openInvite');
const musicBtn = document.getElementById('musicBtn');
const menuBtn = document.getElementById('menuBtn');
const pageMenu = document.getElementById('pageMenu');
const pageNumber = document.getElementById('pageNumber');

let musicOn = false;
let audioCtx, master, musicTimer;
let page = 1;

const melody = [
  [261.63,.24],[329.63,.24],[392,.24],[523.25,.42],
  [392,.24],[329.63,.24],[293.66,.24],[329.63,.48],
  [261.63,.24],[329.63,.24],[392,.24],[587.33,.42],
  [523.25,.24],[392,.24],[329.63,.24],[261.63,.58]
];

function startMusic(){
  if(musicOn) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain();
  master.gain.value = 0.045;
  master.connect(audioCtx.destination);
  musicOn = true;
  let i = 0;

  function note(){
    if(!musicOn) return;
    const [freq,duration] = melody[i % melody.length];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.0001,audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.55,audioCtx.currentTime+.025);
    gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration-.03);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    osc.stop(audioCtx.currentTime+duration);
    i++;
    musicTimer = setTimeout(note,(duration+.05)*1000);
  }
  note();
  musicBtn.textContent = '♫';
}

function stopMusic(){
  musicOn = false;
  clearTimeout(musicTimer);
  if(master && audioCtx){
    master.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.12);
  }
  musicBtn.textContent = '♪';
}

function showPage(number){
  page = number;
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.toggle('active',p.dataset.page === String(number));
  });
  pageNumber.textContent = String(number).padStart(2,'0');
  pageMenu.classList.remove('show');
  window.scrollTo({top:0,behavior:'smooth'});
}

openInvite.addEventListener('click',()=>{
  welcome.classList.add('hide');
  invite.classList.add('show');
  invite.setAttribute('aria-hidden','false');
  startMusic();
});

musicBtn.addEventListener('click',()=>{
  musicOn ? stopMusic() : startMusic();
});

menuBtn.addEventListener('click',()=>pageMenu.classList.toggle('show'));

document.querySelectorAll('[data-next]').forEach(btn=>{
  btn.addEventListener('click',()=>showPage(Number(btn.dataset.next)));
});

document.querySelectorAll('[data-go]').forEach(btn=>{
  btn.addEventListener('click',()=>showPage(Number(btn.dataset.go)));
});

document.addEventListener('keydown',e=>{
  if(e.key === 'ArrowRight') showPage(2);
  if(e.key === 'ArrowLeft') showPage(1);
  if(e.key === 'Escape') pageMenu.classList.remove('show');
});

// Mobile swipe navigation
let touchStartX = 0;
document.addEventListener('touchstart',e=>{
  touchStartX = e.changedTouches[0].screenX;
},{passive:true});
document.addEventListener('touchend',e=>{
  const dx = e.changedTouches[0].screenX - touchStartX;
  if(Math.abs(dx) > 55){
    if(dx < 0) showPage(2);
    else showPage(1);
  }
},{passive:true});
