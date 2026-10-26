import {
  H,
  NOVA_FLASH_DURATION,
  POINTS,
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
export function createAsteroidsGame(canvas: HTMLCanvasElement) {
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
  function killShip() {
    explode(ship.x, ship.y, 14);
    ship.dead = true;
    lives--;
    if (lives <= 0) {
      state = 'gameover';
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
  function loop(ts: number) {
    const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
    lastTime = ts;
    update(dt);
    rafId = requestAnimationFrame(loop);
  }
  initGame();
  rafId = requestAnimationFrame(loop);
  return {
    canvas,
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}
