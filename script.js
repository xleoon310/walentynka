const yes = document.getElementById("yes");
const no = document.getElementById("no");
const result = document.getElementById("result");

const gifWrap = document.getElementById("gifWrap");
const valGif = document.getElementById("valGif");

// GIF: najlepiej lokalny plik w folderze projektu
const GIF_SRC = "valentine.gif";

function show(msg) {
  result.hidden = false;
  result.textContent = msg;
}

// --- UCIEKANIE "NIE" PO EKRANIE ---
function moveNoAnywhere() {
  const pad = 12;
  const btnW = no.offsetWidth;
  const btnH = no.offsetHeight;

  const maxX = window.innerWidth - btnW - pad;
  const maxY = window.innerHeight - btnH - pad;

  const x = Math.max(pad, Math.random() * maxX);
  const y = Math.max(pad, Math.random() * maxY);

  no.style.left = `${x}px`;
  no.style.top = `${y}px`;
  no.style.transform = "none";
}

// --- PERSISTENTNE ANGRY EMOJKI + SKALOWANIE ---
let attempts = 0;
const spawned = []; // tu trzymamy emotki, żeby je potem usunąć

const angryEmojis = ["😡", "🤬", "👿", "💢", "😤"];

// tworzy emotki, które zostają (bez auto-usuwania)
function spawnAngryPersistent(count = 8) {
  // rośnie rozmiar wraz z próbami
  const sizeBase = 18;
  const sizeGrow = 3; // ile px na próbę
  const size = sizeBase + attempts * sizeGrow;

  for (let i = 0; i < count; i++) {
    const e = document.createElement("div");
    e.textContent = angryEmojis[Math.floor(Math.random() * angryEmojis.length)];
    e.style.position = "fixed";
    e.style.zIndex = 9999;
    e.style.fontSize = `${size + Math.random() * 10}px`;
    e.style.left = `${Math.random() * window.innerWidth}px`;
    e.style.top = `${Math.random() * window.innerHeight}px`;
    e.style.pointerEvents = "none";
    e.style.userSelect = "none";

    // mały "pop" przy pojawieniu, ale zostaje
    e.animate(
      [
        { transform: "scale(0.2)", opacity: 0 },
        { transform: "scale(1.15)", opacity: 1, offset: 0.6 },
        { transform: "scale(1.0)", opacity: 1 }
      ],
      { duration: 220, easing: "ease-out" }
    );

    document.body.appendChild(e);
    spawned.push(e);
  }
}

// powiększa przycisk TAK z każdą próbą
function growYesButton() {
  const baseFont = 16;
  const basePadY = 14;
  const basePadX = 28;

  const fontGrow = 2.5;   // 🔥 ile px na próbę
  const padGrow = 6;      // 🔥 ile paddingu na próbę

  const maxFont = 48;     // limit czytelności
  const maxPadX = 140;

  const fontSize = Math.min(baseFont + attempts * fontGrow, maxFont);
  const padX = Math.min(basePadX + attempts * padGrow, maxPadX);
  const padY = Math.min(basePadY + attempts * (padGrow / 2), 60);

  yes.style.fontSize = `${fontSize}px`;
  yes.style.padding = `${padY}px ${padX}px`;
}

yes.scrollIntoView({ behavior: "smooth", block: "center" });

// każde najechanie = nowa próba
function onNoAttempt() {
  attempts += 1;
  spawnAngryPersistent(8);
  growYesButton();
  moveNoAnywhere();
}

// tylko hover/attempty — bez klikania NIE
no.addEventListener("mouseenter", onNoAttempt);

// telefon: dotyk = próba
no.addEventListener("touchstart", onNoAttempt, { passive: true });


// --- FAJERWERKI (zostają jak było) ---
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let particles = [];
let animId = null;

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function burst(x, y) {
  const n = 80 + Math.floor(Math.random() * 60);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 2 + Math.random() * 6;
    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 70 + Math.random() * 50,
      r: 2 + Math.random() * 2
    });
  }
}

function step() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  if (Math.random() < 0.14) {
    burst(
      80 + Math.random() * (window.innerWidth - 160),
      80 + Math.random() * (window.innerHeight - 220)
    );
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= 1;
    p.vy += 0.06;
    p.vx *= 0.99;
    p.vy *= 0.99;

    p.x += p.vx;
    p.y += p.vy;

    const alpha = Math.max(0, Math.min(1, p.life / 100));
    ctx.globalAlpha = alpha;

    ctx.fillStyle = `hsl(${(p.x + p.y) % 360} 90% 60%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    if (p.life <= 0) particles.splice(i, 1);
  }
  ctx.globalAlpha = 1;

  animId = requestAnimationFrame(step);
}

function startFireworks(durationMs = 2600) {
  if (animId) cancelAnimationFrame(animId);
  particles = [];

  const start = performance.now();
  (function loop(t) {
    step();
    if (t - start > durationMs) {
      cancelAnimationFrame(animId);
      animId = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles = [];
    } else {
      requestAnimationFrame(loop);
    }
  })(start);
}


// --- TAK: usuń angry, pokaż gif, fajerwerki ---
yes.addEventListener("click", () => {
  show("YESS! 💘 Kocham Cię!!! 💝");

  // znikają emotki angry
  spawned.forEach(el => el.remove());
  spawned.length = 0;

  // reset powiększania
  attempts = 0;
  yes.style.transform = "none";

  // schowaj NIE
  no.style.display = "none";
  yes.disabled = true;

  // pokaż gif
  valGif.src = GIF_SRC;
  gifWrap.hidden = false;

  // fajerwerki
  startFireworks(2800);
});
