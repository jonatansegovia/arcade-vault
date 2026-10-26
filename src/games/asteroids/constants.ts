export const W = 800;
export const H = 600;
// Indexados por tamaño del asteroide: 1 (pequeño), 2 (mediano), 3 (grande)
export const RADII = [0, 16, 30, 50];
export const SPEEDS = [0, 85, 55, 32]; // px/s base
export const POINTS = [0, 100, 50, 20];
// Silueta fija (variación especial) para asteroides grandes
export const LARGE_ASTEROID_SHAPE: ReadonlyArray<readonly [number, number]> = [
  [-0.042, -0.981],
  [0.425, -0.754],
  [0.404, -0.174],
  [0.992, -0.032],
  [0.779, 0.556],
  [0.354, 0.591],
  [0.035, 0.981],
  [-0.637, 0.662],
  [-0.992, 0.039],
  [-0.85, -0.528],
  [-0.46, -0.838],
];
export const LARGE_SHAPE_CHANCE = 0.2; // probabilidad de usar la silueta fija
// Power-ups (segundos)
export const TRIPLE_SHOT_DURATION = 5;
export const TRIPLE_SHOT_TTL = 10;
export const TRIPLE_SHOT_COLOR = '#00e5ff';
export const NOVA_BOMB_TTL = 10;
export const NOVA_BOMB_COLOR = '#ff6a00';
export const NOVA_FLASH_DURATION = 0.35;
export const wrap = (v: number, max: number): number => ((v % max) + max) % max;
export const dist = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): number => Math.hypot(a.x - b.x, a.y - b.y);
export const rand = (min: number, max: number): number =>
  min + Math.random() * (max - min);
export const randInt = (min: number, max: number): number =>
  Math.floor(rand(min, max + 1));
