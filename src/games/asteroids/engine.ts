import {
  H,
  NOVA_BOMB_COLOR,
  NOVA_FLASH_DURATION,
  POINTS,
  TRIPLE_SHOT_COLOR,
  TRIPLE_SHOT_DURATION,
  W,
  dist,
  rand,
} from './constants';
import {
  Asteroid,
  Bullet,
  Particle,
  PowerUp,
  Ship,
  type Keys,
} from './entities';
type GameState = 'playing' | 'dead' | 'gameover';
const PREVENT_DEFAULT_KEYS = [
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
];
const MAX_DT = 0.05;
export interface AsteroidsCallbacks {
  onScore: (score: number) => void;
  onLives: (lives: number) => void;
  onLevel: (level: number) => void;
  onGameOver: (finalScore: number) => void;
}
export interface AsteroidsGame {
  pause: () => void;
  resume: () => void;
  end: () => void; // fuerza game over con la puntuación actual
  restart: () => void;
  destroy: () => void; // cancela el loop y quita listeners
}
export function createAsteroidsGame(
  canvas: HTMLCanvasElement,
  callbacks: AsteroidsCallbacks,
): AsteroidsGame {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D no disponible');
  const ctx: CanvasRenderingContext2D = context;
  // ── Input ───────────────────────────────────────────────────────────────────
  const keys: Keys = {};
  const justPressed: Keys = {};
  const onKeyDown = (e: KeyboardEvent) => {
    justPressed[e.code] = !keys[e.code];
    keys[e.code] = true;
    if (PREVENT_DEFAULT_KEYS.includes(e.code)) e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    keys[e.code] = false;
  };
  function pressed(code: string): boolean {
    const val = !!justPressed[code];
    justPressed[code] = false;
    return val;
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  // ── Estado del juego ────────────────────────────────────────────────────────
  let ship: Ship;
  let bullets: Bullet[];
  let asteroids: Asteroid[];
  let particles: Particle[];
  let powerups: PowerUp[];
  let score: number;
  let lives: number;
  let level: number;
  let state: GameState;
  let deadTimer = 0;
  let tripleShotSpawned: boolean;
  let novaBombCanSpawn: boolean;
  let novaBombSpawned: boolean;
  let novaFlash: number;
  function spawnAsteroids(count: number) {
    const SAFE_DIST = 130;
    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      do {
        x = rand(0, W);
        y = rand(0, H);
      } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
      asteroids.push(new Asteroid(x, y, 3));
    }
  }
  function initGame() {
    ship = new Ship();
    bullets = [];
    asteroids = [];
    particles = [];
    powerups = [];
    score = 0;
    lives = 3;
    level = 1;
    state = 'playing';
    tripleShotSpawned = false;
    novaBombCanSpawn = Math.random() < 0.5;
    novaBombSpawned = false;
    novaFlash = 0;
    spawnAsteroids(4);
  }
  function nextLevel() {
    level++;
    bullets = [];
    particles = [];
    powerups = [];
    tripleShotSpawned = false;
    ship.reset();
    spawnAsteroids(3 + level);
  }
  function explode(x: number, y: number, count = 8) {
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
  }
  function finishGame() {
    if (state === 'gameover') return;
    state = 'gameover';
    callbacks.onGameOver(score);
  }
  function killShip() {
    explode(ship.x, ship.y, 14);
    ship.dead = true;
    lives--;
    if (lives <= 0) {
      finishGame();
    } else {
      state = 'dead';
      deadTimer = 2;
    }
  }
  function detonateNovaBomb() {
    for (const a of asteroids) {
      score += Math.round(POINTS[a.size] * 0.5);
      explode(a.x, a.y, a.size * 5);
      a.dead = true;
    }
    asteroids = asteroids.filter((a) => !a.dead);
    ship.hasNovaBomb = false;
    novaFlash = NOVA_FLASH_DURATION;
  }
  // ── Update ──────────────────────────────────────────────────────────────────
  function update(dt: number) {
    if (novaFlash > 0) novaFlash -= dt;
    if (state === 'gameover') {
      particles.forEach((p) => p.update(dt));
      particles = particles.filter((p) => !p.dead);
      return;
    }
    if (state === 'dead') {
      deadTimer -= dt;
      particles.forEach((p) => p.update(dt));
      particles = particles.filter((p) => !p.dead);
      asteroids.forEach((a) => a.update(dt));
      powerups.forEach((p) => p.update(dt));
      powerups = powerups.filter((p) => !p.dead);
      if (deadTimer <= 0) {
        state = 'playing';
        ship.reset();
      }
      return;
    }
    // Disparar
    if (pressed('Space')) {
      bullets.push(...ship.tryShoot());
    }
    // Bomba Nova
    if (ship.hasNovaBomb && pressed('ControlRight')) {
      detonateNovaBomb();
    }
    ship.update(dt, keys);
    bullets.forEach((b) => b.update(dt));
    asteroids.forEach((a) => a.update(dt));
    particles.forEach((p) => p.update(dt));
    powerups.forEach((p) => p.update(dt));
    bullets = bullets.filter((b) => !b.dead);
    particles = particles.filter((p) => !p.dead);
    powerups = powerups.filter((p) => !p.dead);
    // Bala vs asteroide
    const newAsteroids: Asteroid[] = [];
    for (const b of bullets) {
      for (const a of asteroids) {
        if (!a.dead && !b.dead && dist(b, a) < a.radius) {
          b.dead = true;
          a.dead = true;
          score += POINTS[a.size];
          explode(a.x, a.y, a.size * 5);
          newAsteroids.push(...a.split());
          if (!tripleShotSpawned && Math.random() < 0.25) {
            powerups.push(new PowerUp(a.x, a.y));
            tripleShotSpawned = true;
          }
          if (novaBombCanSpawn && !novaBombSpawned && Math.random() < 0.25) {
            powerups.push(new PowerUp(a.x, a.y, 'nova'));
            novaBombSpawned = true;
          }
        }
      }
    }
    asteroids = asteroids.filter((a) => !a.dead).concat(newAsteroids);
    bullets = bullets.filter((b) => !b.dead);
    // Nave vs power-up
    for (const p of powerups) {
      if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
        if (p.kind === 'nova') {
          ship.hasNovaBomb = true;
        } else {
          ship.tripleTimer = TRIPLE_SHOT_DURATION;
        }
        p.dead = true;
      }
    }
    powerups = powerups.filter((p) => !p.dead);
    // Nave vs asteroide
    if (ship.invincible <= 0) {
      for (const a of asteroids) {
        if (dist(ship, a) < ship.radius + a.radius * 0.82) {
          killShip();
          break;
        }
      }
    }
    // Nivel completado
    if (asteroids.length === 0) nextLevel();
  }
  // ── Loop principal ──────────────────────────────────────────────────────────
  let lastTime: number | null = null;
  let rafId = 0;
  let paused = false;
  // Último valor notificado: los callbacks solo se invocan al cambiar
  let sentScore = -1;
  let sentLives = -1;
  let sentLevel = -1;
  function emit() {
    if (score !== sentScore) {
      sentScore = score;
      callbacks.onScore(score);
    }
    if (lives !== sentLives) {
      sentLives = lives;
      callbacks.onLives(lives);
    }
    if (level !== sentLevel) {
      sentLevel = level;
      callbacks.onLevel(level);
    }
  }
  function loop(ts: number) {
    const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
    lastTime = ts;
    if (!paused) {
      update(dt);
      emit();
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }
  // ── Draw ────────────────────────────────────────────────────────────────────
  function drawLifeIcon(x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-6, 5);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  function drawHUD() {
    ctx.fillStyle = '#fff';
    ctx.font = '15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE  ${score}`, 14, 26);
    let statusY = 46;
    if (ship.tripleTimer > 0) {
      const blink =
        ship.tripleTimer < 2 && Math.floor(ship.tripleTimer * 6) % 2 === 0;
      if (!blink) {
        ctx.fillStyle = TRIPLE_SHOT_COLOR;
        ctx.font = '13px monospace';
        ctx.fillText(`x3  ${Math.ceil(ship.tripleTimer)}s`, 14, statusY);
      }
      statusY += 20;
    }
    if (ship.hasNovaBomb) {
      ctx.fillStyle = NOVA_BOMB_COLOR;
      ctx.font = '13px monospace';
      ctx.fillText('BOMBA NOVA LISTA (CTRL DER)', 14, statusY);
    }
    ctx.fillStyle = '#fff';
    ctx.font = '15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`NIVEL ${level}`, W / 2, 26);
    for (let i = 0; i < lives; i++) drawLifeIcon(W - 16 - i * 22, 18);
  }
  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    particles.forEach((p) => p.draw(ctx));
    powerups.forEach((p) => p.draw(ctx));
    asteroids.forEach((a) => a.draw(ctx));
    bullets.forEach((b) => b.draw(ctx));
    ship.draw(ctx);
    if (novaFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${((novaFlash / NOVA_FLASH_DURATION) * 0.6).toFixed(2)})`;
      ctx.fillRect(0, 0, W, H);
    }
    drawHUD();
  }
  initGame();
  emit();
  rafId = requestAnimationFrame(loop);
  return {
    pause() {
      paused = true;
    },
    resume() {
      if (!paused) return;
      paused = false;
      lastTime = null; // evita un dt enorme tras la pausa
      for (const k of Object.keys(justPressed)) justPressed[k] = false;
    },
    end() {
      finishGame();
    },
    restart() {
      initGame();
      paused = false;
      lastTime = null;
      for (const k of Object.keys(justPressed)) justPressed[k] = false;
      sentScore = sentLives = sentLevel = -1;
      emit();
    },
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}
