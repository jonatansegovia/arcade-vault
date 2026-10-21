'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

// Skin definitions
const SKINS = {
  retro: {
    name: 'Retro',
    colors: [
      null,
      '#4dd0e1', // I - cyan
      '#ffd54f', // O - yellow
      '#ba68c8', // T - purple
      '#81c784', // S - green
      '#e57373', // Z - red
      '#64b5f6', // J - pale blue
      '#ffb74d', // L - orange
      '#9e9e9e', // N - nut (tuerca)
    ],
    glowIntensity: 0,
    borderRadius: false,
  },
  neon: {
    name: 'Neon',
    colors: [
      null,
      '#00ffff', // I - cyan neon
      '#ffff00', // O - yellow neon
      '#ff00ff', // T - magenta neon
      '#00ff00', // S - green neon
      '#ff0000', // Z - red neon
      '#0099ff', // J - blue neon
      '#ff6600', // L - orange neon
      '#cccccc', // N - gray neon
    ],
    glowIntensity: 15,
    borderRadius: false,
  },
  pastel: {
    name: 'Pastel',
    colors: [
      null,
      '#a8e6cf', // I - mint
      '#ffe0b6', // O - peach
      '#c9b1ff', // T - lavender
      '#b5f2b5', // S - mint green
      '#ffb3ba', // Z - coral
      '#a8d8ff', // J - sky blue
      '#ffcba4', // L - tan
      '#d4d4d4', // N - light gray
    ],
    glowIntensity: 0,
    borderRadius: true,
  },
  pixel: {
    name: 'Pixel Art',
    colors: [
      null,
      '#1f9db8', // I - darker cyan
      '#e0c000', // O - darker yellow
      '#8b4ba8', // T - darker purple
      '#5a8c4a', // S - darker green
      '#c24545', // Z - darker red
      '#3d6fa8', // J - darker blue
      '#c97330', // L - darker orange
      '#707070', // N - darker gray
    ],
    glowIntensity: 0,
    borderRadius: false,
  },
};

let currentSkin = 'retro';

function getColors() {
  return SKINS[currentSkin].colors;
}

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[8,8,8],[8,0,8],[8,8,8]],                  // N - nut (tuerca)
];

const LINE_SCORES = [0, 100, 300, 500, 800];
const TSPIN_SCORES = [400, 800, 1200, 1600];
const PERFECT_CLEAR_BONUS = 2000;
const B2B_MULTIPLIER = 1.5;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

const GRID_COLORS = { dark: '#22222e', light: '#d8d8e4' };

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId, theme, comboCount, b2bActive, audioCtx, bestCombo, maxLines;

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * (PIECES.length - 1)) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0, lastRotation: false };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      current.lastRotation = true;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function clearLines(tspin) {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  let gain = 0;
  if (cleared > 0) {
    comboCount++;
    bestCombo = Math.max(bestCombo, comboCount);
    lines += cleared;
    maxLines = Math.max(maxLines, lines);
    gain = (tspin ? TSPIN_SCORES[cleared] : LINE_SCORES[cleared]) * level;
    let isB2B = false;
    if (cleared === 4) {
      if (b2bActive) {
        gain *= B2B_MULTIPLIER;
        isB2B = true;
      }
      b2bActive = true;
    } else {
      b2bActive = false;
    }
    gain *= comboCount;
    score += gain;
    const perfectClear = board.every(row => row.every(v => v === 0));
    if (perfectClear) {
      score += PERFECT_CLEAR_BONUS * level;
      triggerFeedback({ cleared, tspin, comboCount, b2b: false, perfectClear: true });
    } else {
      triggerFeedback({ cleared, tspin, comboCount, b2b: isB2B, perfectClear: false });
    }
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    updateHUD();
  } else {
    comboCount = 0;
    if (tspin) {
      gain = TSPIN_SCORES[0] * level;
      score += gain;
      triggerFeedback({ cleared: 0, tspin: true, comboCount: 0, b2b: false, perfectClear: false });
      updateHUD();
    }
  }
}

function isTSpin() {
  if (current.type !== 3 || !current.lastRotation) return false;
  const cx = current.x + 1, cy = current.y + 1;
  const corners = [[cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1], [cx + 1, cy + 1]];
  let blocked = 0;
  for (const [x, y] of corners) {
    if (x < 0 || x >= COLS || y >= ROWS) blocked++;
    else if (y >= 0 && board[y][x]) blocked++;
  }
  return blocked >= 3;
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  const tspin = isTSpin();
  merge();
  clearLines(tspin);
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  const colors = getColors();
  const color = colors[colorIndex];
  const skin = SKINS[currentSkin];
  context.globalAlpha = alpha ?? 1;
  const px = x * size;
  const py = y * size;

  if (currentSkin === 'neon') {
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = skin.glowIntensity;
    context.fillRect(px + 1, py + 1, size - 2, size - 2);
    context.shadowBlur = 0;
  } else if (currentSkin === 'pastel') {
    context.fillStyle = color;
    const rad = 4;
    context.beginPath();
    context.moveTo(px + 1 + rad, py + 1);
    context.lineTo(px + size - 1 - rad, py + 1);
    context.quadraticCurveTo(px + size - 1, py + 1, px + size - 1, py + 1 + rad);
    context.lineTo(px + size - 1, py + size - 1 - rad);
    context.quadraticCurveTo(px + size - 1, py + size - 1, px + size - 1 - rad, py + size - 1);
    context.lineTo(px + 1 + rad, py + size - 1);
    context.quadraticCurveTo(px + 1, py + size - 1, px + 1, py + size - 1 - rad);
    context.lineTo(px + 1, py + 1 + rad);
    context.quadraticCurveTo(px + 1, py + 1, px + 1 + rad, py + 1);
    context.fill();
    // soft highlight
    context.fillStyle = 'rgba(255,255,255,0.2)';
    context.fillRect(px + 1, py + 1, size - 2, 3);
  } else if (currentSkin === 'pixel') {
    // pixel art pattern
    context.fillStyle = color;
    context.fillRect(px + 1, py + 1, size - 2, size - 2);
    const mid = size / 2;
    context.fillStyle = 'rgba(0,0,0,0.2)';
    for (let dx = 0; dx < size - 2; dx += 3) {
      for (let dy = 0; dy < size - 2; dy += 3) {
        context.fillRect(px + 1 + dx, py + 1 + dy, 1, 1);
      }
    }
  } else {
    // retro default
    context.fillStyle = color;
    context.fillRect(px + 1, py + 1, size - 2, size - 2);
    // highlight
    context.fillStyle = 'rgba(255,255,255,0.12)';
    context.fillRect(px + 1, py + 1, size - 2, 4);
  }
  context.globalAlpha = 1;
}

function drawGrid() {
  ctx.strokeStyle = GRID_COLORS[theme];
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
}

function getRecords() {
  const stored = localStorage.getItem('tetrisRecords');
  return stored ? JSON.parse(stored) : [];
}

function saveRecords(records) {
  localStorage.setItem('tetrisRecords', JSON.stringify(records));
}

function addRecord(name, score, lines, combo) {
  const records = getRecords();
  const timestamp = new Date();
  records.push({
    name,
    score,
    lines,
    combo,
    date: timestamp.toLocaleDateString('es-ES'),
    time: timestamp.toLocaleTimeString('es-ES')
  });
  records.sort((a, b) => b.score - a.score);
  saveRecords(records);
}

function isTopScore(score) {
  const records = getRecords();
  if (records.length < 5) return true;
  return score > records[records.length - 1].score;
}

function resetRecords() {
  if (confirm('¿Estás seguro de que quieres borrar todos los records?')) {
    localStorage.removeItem('tetrisRecords');
    displayRecords();
  }
}

function displayRecords() {
  const allRecords = getRecords();
  const recordsList = document.getElementById('records-list');
  const recordCount = document.getElementById('record-count');

  if (!recordsList) {
    console.warn('No se encontró records-list');
    return;
  }

  recordsList.innerHTML = '';
  if (recordCount) {
    const countText = allRecords.length === 1 ? '1 registro' : `${allRecords.length} registros`;
    recordCount.textContent = countText;
  }

  if (allRecords.length === 0) {
    recordsList.innerHTML = '<li class="no-records">Sin records aún</li>';
    return;
  }

  const topRecords = allRecords.slice(0, 5);
  topRecords.forEach((rec, idx) => {
    const li = document.createElement('li');
    li.className = 'record-item';
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
    li.innerHTML = `
      <span class="rank">${medal} #${idx + 1}</span>
      <span class="name">${rec.name}</span>
      <span class="score">${rec.score.toLocaleString()}</span>
    `;
    recordsList.appendChild(li);
  });
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = 'GAME OVER';

  const isTop = isTopScore(score);
  let content = `Puntuación: ${score.toLocaleString()}\nLíneas: ${lines} | Combo: ${bestCombo}`;

  if (isTop) {
    content += '\n\n🏆 ¡Entraste en el Top 5!';
  }

  overlayScore.innerHTML = content.replace(/\n/g, '<br>');

  const nameInputDiv = document.getElementById('name-input-div');
  const nameInput = document.getElementById('name-input');
  const nameSubmitBtn = document.getElementById('name-submit-btn');

  // Siempre mostrar input de nombre
  nameInputDiv.classList.remove('hidden');
  nameInput.value = '';
  nameInput.placeholder = isTop ? '¡Ingresa tu nombre!' : 'Tu nombre (opcional)';
  nameInput.focus();

  const submitName = () => {
    const name = nameInput.value.trim() || 'Anonymous';
    addRecord(name, score, lines, bestCombo);
    displayRecords();
    nameInputDiv.classList.add('hidden');
  };

  nameSubmitBtn.onclick = submitName;
  nameInput.onkeydown = (e) => {
    if (e.key === 'Enter') submitName();
  };

  overlay.classList.remove('hidden');
}

function initAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq, duration, type = 'sine') {
  initAudioCtx();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

function showComboPopup(text) {
  const popup = document.getElementById('combo-popup');
  popup.textContent = text;
  popup.classList.remove('hidden');
  popup.classList.add('show');
  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('hidden');
  }, 600);
}

function shakeBoard() {
  const board = document.getElementById('board');
  board.classList.add('shake');
  setTimeout(() => board.classList.remove('shake'), 300);
}

function triggerFeedback({ cleared, tspin, comboCount, b2b, perfectClear }) {
  if (perfectClear) {
    showComboPopup('PERFECT CLEAR!');
    shakeBoard();
    playTone(523.25, 0.1);
    playTone(659.25, 0.1);
    playTone(783.99, 0.15);
  } else if (b2b && cleared === 4) {
    showComboPopup('B2B TETRIS!');
    shakeBoard();
    playTone(220, 0.15);
  } else if (cleared === 4 && !b2b) {
    showComboPopup('TETRIS!');
    shakeBoard();
    playTone(220, 0.1);
  } else if (tspin && cleared > 0) {
    showComboPopup(`T-SPIN x${comboCount}`);
    shakeBoard();
    playTone(392, 0.1);
    playTone(330, 0.1);
  } else if (tspin && cleared === 0) {
    showComboPopup('T-SPIN!');
    playTone(392, 0.08);
  } else if (comboCount >= 2) {
    const notes = [261.63, 293.66, 329.63, 349.23, 392, 440];
    const freq = notes[Math.min(comboCount - 2, notes.length - 1)];
    showComboPopup(`COMBO x${comboCount}`);
    playTone(freq, 0.08);
  } else if (cleared > 0) {
    const lineTexts = ['', 'SINGLE', 'DOUBLE', 'TRIPLE'];
    showComboPopup(lineTexts[cleared] || '');
    playTone(440, 0.05);
  }
}

function getRecords() {
  const stored = localStorage.getItem('tetrisRecords');
  return stored ? JSON.parse(stored) : [];
}

function saveRecords(records) {
  localStorage.setItem('tetrisRecords', JSON.stringify(records));
}

function addRecord(name, score, lines, combo) {
  const records = getRecords();
  records.push({ name, score, lines, combo, date: new Date().toLocaleDateString('es-ES') });
  records.sort((a, b) => b.score - a.score);
  records.splice(5);
  saveRecords(records);
}

function isTopScore(score) {
  const records = getRecords();
  if (records.length < 5) return true;
  return score > records[records.length - 1].score;
}

function resetRecords() {
  if (confirm('¿Estás seguro de que quieres borrar todos los records?')) {
    localStorage.removeItem('tetrisRecords');
    displayRecords();
  }
}

function displayRecords() {
  const records = getRecords();
  const recordsList = document.getElementById('records-list');

  if (!recordsList) {
    console.warn('No se encontró records-list');
    return;
  }

  recordsList.innerHTML = '';
  if (records.length === 0) {
    recordsList.innerHTML = '<li class="no-records">Sin records</li>';
    return;
  }

  records.forEach((rec, idx) => {
    const li = document.createElement('li');
    li.className = 'record-item';
    li.innerHTML = `<span class="rank">#${idx + 1}</span> <span class="name">${rec.name}</span> <span class="score">${rec.score.toLocaleString()}</span>`;
    recordsList.appendChild(li);
  });
}

function setSkin(skinName) {
  if (SKINS[skinName]) {
    currentSkin = skinName;
    localStorage.setItem('tetris-skin', skinName);
    updateSkinButtons();
    draw();
    drawNext();
  }
}

function updateSkinButtons() {
  document.querySelectorAll('.skin-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.skin === currentSkin);
  });
}

function loadSkinPreference() {
  const saved = localStorage.getItem('tetris-skin');
  if (saved && SKINS[saved]) {
    currentSkin = saved;
    updateSkinButtons();
  }
}

function setTheme(newTheme) {
  theme = newTheme;
  document.body.dataset.theme = theme;
  themeToggleBtn.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
  themeToggleBtn.setAttribute('aria-pressed', theme === 'light');
}

function toggleTheme() {
  setTheme(theme === 'dark' ? 'light' : 'dark');
  draw();
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (paused) {
    cancelAnimationFrame(animId);
    overlayTitle.textContent = 'PAUSA';
    overlayScore.textContent = '';
    overlay.classList.remove('hidden');
  } else {
    lastTime = performance.now();
    overlay.classList.add('hidden');
    animId = requestAnimationFrame(loop);
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  if (gameOver) return;
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  paused = false;
  gameOver = false;
  dropInterval = 1000;
  dropAccum = 0;
  lastTime = performance.now();
  comboCount = 0;
  b2bActive = false;
  bestCombo = 0;
  maxLines = 0;
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  displayRecords();
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  initAudioCtx();
  if (e.code === 'KeyP') { togglePause(); return; }
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) {
        current.x--;
        current.lastRotation = false;
      }
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) {
        current.x++;
        current.lastRotation = false;
      }
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', init);
themeToggleBtn.addEventListener('click', toggleTheme);

// Skin selector buttons
document.querySelectorAll('.skin-btn').forEach(btn => {
  btn.addEventListener('click', () => setSkin(btn.dataset.skin));
});

setTheme('dark');
loadSkinPreference();
init();
