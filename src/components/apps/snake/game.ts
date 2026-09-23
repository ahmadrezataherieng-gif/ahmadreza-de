/**
 * Snake (Phase 9D-1, DECISIONS.md 57), unlocked by the 1981 puzzle: the board
 * is finite, like 640 KB, and the snake fills it. The rules as pure functions
 * - movement, turning, growth, collision, food - so plain node tests them
 * (`scripts/test/snake.test.mjs`); the component only draws and keeps time.
 */

export type Direction = 'up' | 'down' | 'left' | 'right';
export const directions: readonly Direction[] = ['up', 'down', 'left', 'right'];

export interface Point {
  x: number;
  y: number;
}

export type Status = 'ready' | 'running' | 'paused' | 'over' | 'won';

export interface SnakeState {
  width: number;
  height: number;
  /** Head first. */
  snake: Point[];
  /** The direction the snake last moved in. */
  heading: Direction;
  /** Turns asked for and not yet taken, at most two: quick double turns work. */
  queue: Direction[];
  food: Point | null;
  score: number;
  status: Status;
}

/** A number in [0, 1): Math.random in the app, a fixed sequence in tests. */
export type Random = () => number;

export const BOARD = 20;
const MAX_QUEUE = 2;

const STEP: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

/** A free cell, chosen at random; null when the snake fills the board. */
export function placeFood(snake: readonly Point[], width: number, height: number, random: Random): Point | null {
  const taken = new Set(snake.map((point) => point.y * width + point.x));
  const free = width * height - taken.size;
  if (free <= 0) return null;
  let pick = Math.min(free - 1, Math.floor(random() * free));
  for (let cell = 0; cell < width * height; cell += 1) {
    if (taken.has(cell)) continue;
    if (pick === 0) return { x: cell % width, y: Math.floor(cell / width) };
    pick -= 1;
  }
  return null;
}

export function newGame(random: Random, width = BOARD, height = BOARD): SnakeState {
  const y = Math.floor(height / 2);
  const x = Math.floor(width / 3);
  const snake = [
    { x, y },
    { x: x - 1, y },
    { x: x - 2, y },
  ];
  return { width, height, snake, heading: 'right', queue: [], food: placeFood(snake, width, height, random), score: 0, status: 'ready' };
}

/**
 * Ask for a turn. Reversing into the snake's own neck and repeating the
 * current direction are ignored, judged against the last queued turn, so
 * "up, left" pressed within one step still works.
 */
export function turn(state: SnakeState, direction: Direction): SnakeState {
  if (state.status === 'over' || state.status === 'won') return state;
  const last = state.queue.at(-1) ?? state.heading;
  if (direction === last || direction === OPPOSITE[last] || state.queue.length >= MAX_QUEUE) return state;
  return { ...state, queue: [...state.queue, direction], status: state.status === 'ready' ? 'running' : state.status };
}

/** One tick: move, eat and grow, or hit a wall or itself. */
export function step(state: SnakeState, random: Random): SnakeState {
  if (state.status !== 'running') return state;
  const [nextHeading = state.heading, ...queue] = state.queue;
  const head = state.snake[0];
  if (!head) return state;
  const delta = STEP[nextHeading];
  const next = { x: head.x + delta.x, y: head.y + delta.y };

  if (next.x < 0 || next.y < 0 || next.x >= state.width || next.y >= state.height) {
    return { ...state, heading: nextHeading, queue: [], status: 'over' };
  }

  const eats = state.food !== null && same(next, state.food);
  // The tail moves out of the way this very step - unless the snake grows.
  const body = eats ? state.snake : state.snake.slice(0, -1);
  if (body.some((point) => same(point, next))) {
    return { ...state, heading: nextHeading, queue: [], status: 'over' };
  }

  const snake = [next, ...body];
  if (!eats) return { ...state, snake, heading: nextHeading, queue };

  const food = placeFood(snake, state.width, state.height, random);
  return { ...state, snake, heading: nextHeading, queue, score: state.score + 1, food, status: food ? 'running' : 'won' };
}

export function togglePause(state: SnakeState): SnakeState {
  if (state.status === 'running') return { ...state, status: 'paused' };
  if (state.status === 'paused') return { ...state, status: 'running' };
  return state;
}

export function pause(state: SnakeState): SnakeState {
  return state.status === 'running' ? { ...state, status: 'paused' } : state;
}

/** Milliseconds per step: a little quicker with every meal, never frantic. */
export function stepInterval(score: number): number {
  return Math.max(75, 160 - score * 3);
}

export function isFinished(state: SnakeState): boolean {
  return state.status === 'over' || state.status === 'won';
}

/** The better of a stored best and a new score; anything malformed counts as none. */
export function bestOf(best: unknown, score: number): number {
  const previous = typeof best === 'number' && Number.isSafeInteger(best) && best >= 0 ? best : 0;
  return Math.max(previous, score);
}

/**
 * A swipe's direction from its movement, or null for a tap or a wobble:
 * it must travel `threshold` px, mostly along one axis.
 */
export function swipeDirection(dx: number, dy: number, threshold = 24): Direction | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < threshold) return null;
  if (ax > ay * 1.2) return dx > 0 ? 'right' : 'left';
  if (ay > ax * 1.2) return dy > 0 ? 'down' : 'up';
  return null;
}

/** Arrow keys and WASD; the physical key, so an AZERTY or a Persian layout plays the same. */
export function keyDirection(code: string): Direction | null {
  switch (code) {
    case 'ArrowUp':
    case 'KeyW':
      return 'up';
    case 'ArrowDown':
    case 'KeyS':
      return 'down';
    case 'ArrowLeft':
    case 'KeyA':
      return 'left';
    case 'ArrowRight':
    case 'KeyD':
      return 'right';
    default:
      return null;
  }
}
