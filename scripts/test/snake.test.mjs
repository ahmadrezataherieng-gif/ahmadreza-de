// Snake (Phase 9D-1): the rules, run as they are.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  bestOf,
  BOARD,
  keyDirection,
  newGame,
  pause,
  placeFood,
  step,
  stepInterval,
  swipeDirection,
  togglePause,
  turn,
} from '../../src/components/apps/snake/game.ts';

const zero = () => 0;
const running = (overrides = {}) => ({ ...newGame(zero), status: 'running', ...overrides });

test('a new game: three segments heading right, food on a free cell, waiting', () => {
  const game = newGame(zero);
  assert.equal(game.width, BOARD);
  assert.equal(game.snake.length, 3);
  assert.equal(game.heading, 'right');
  assert.equal(game.status, 'ready');
  assert.ok(game.food && !game.snake.some((p) => p.x === game.food.x && p.y === game.food.y));
});

test('moving: the head advances, the tail follows, the length stays', () => {
  const game = running({ food: { x: 0, y: 0 } });
  const next = step(game, zero);
  assert.deepEqual(next.snake[0], { x: game.snake[0].x + 1, y: game.snake[0].y });
  assert.equal(next.snake.length, 3);
  assert.deepEqual(next.snake.at(-1), game.snake[1]);
});

test('eating: grows by one, scores one, food moves to a free cell', () => {
  const head = newGame(zero).snake[0];
  const game = running({ food: { x: head.x + 1, y: head.y } });
  const next = step(game, zero);
  assert.equal(next.snake.length, 4);
  assert.equal(next.score, 1);
  assert.ok(next.food);
  assert.ok(!next.snake.some((p) => p.x === next.food.x && p.y === next.food.y), 'never under the snake');
});

test('walls end the game: the board is finite', () => {
  const game = running({ snake: [{ x: BOARD - 1, y: 5 }, { x: BOARD - 2, y: 5 }], food: { x: 0, y: 0 } });
  assert.equal(step(game, zero).status, 'over');
  const top = running({ snake: [{ x: 3, y: 0 }, { x: 3, y: 1 }], heading: 'up', food: { x: 9, y: 9 } });
  assert.equal(step(top, zero).status, 'over');
});

test('biting itself ends the game; the tail that moves away does not count', () => {
  // A 2x2 loop: head at (5,5), moving down into (5,6) where the tail is.
  const snake = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }];
  const chasingTail = running({ snake, heading: 'left', queue: ['down'], food: { x: 0, y: 0 } });
  assert.equal(step(chasingTail, zero).status, 'running', 'the tail leaves this step');
  const longer = [...snake, { x: 4, y: 6 }];
  const bite = running({ snake: longer, heading: 'left', queue: ['down'], food: { x: 0, y: 0 } });
  assert.equal(step(bite, zero).status, 'over');
  // Growing into the tail's cell does bite: the tail stays when the snake eats.
  const growing = running({ snake, heading: 'left', queue: ['down'], food: { x: 5, y: 6 } });
  assert.equal(step(growing, zero).status, 'over');
});

test('turning: no reversal, no repeats, two turns queue within one step', () => {
  const game = running();
  assert.equal(turn(game, 'left'), game, 'reversing into the neck is ignored');
  assert.equal(turn(game, 'right'), game, 'the same direction is ignored');
  const queued = turn(turn(game, 'up'), 'left');
  assert.deepEqual(queued.queue, ['up', 'left']);
  assert.deepEqual(turn(queued, 'down').queue, ['up', 'left'], 'at most two');
  const one = step(queued, zero);
  const two = step(one, zero);
  assert.equal(one.heading, 'up');
  assert.equal(two.heading, 'left');
  assert.equal(turn(newGame(zero), 'up').status, 'running', 'a turn starts a waiting game');
});

test('pause and resume; nothing moves while paused or over', () => {
  const game = running();
  const paused = togglePause(game);
  assert.equal(paused.status, 'paused');
  assert.equal(step(paused, zero), paused);
  assert.equal(togglePause(paused).status, 'running');
  assert.equal(pause(newGame(zero)).status, 'ready', 'a waiting game is not paused');
  const over = { ...game, status: 'over' };
  assert.equal(step(over, zero), over);
  assert.equal(turn(over, 'up'), over);
});

test('food: only free cells, none when the board is full, and a full board is a win', () => {
  const snake = [];
  for (let y = 0; y < 3; y += 1) for (let x = 0; x < 3; x += 1) if (!(x === 2 && y === 2)) snake.push({ x, y });
  assert.deepEqual(placeFood(snake, 3, 3, zero), { x: 2, y: 2 });
  assert.deepEqual(placeFood(snake, 3, 3, () => 0.999), { x: 2, y: 2 });
  assert.equal(placeFood([...snake, { x: 2, y: 2 }], 3, 3, zero), null);
  // A snake one cell from filling a 2x2 board eats its last meal.
  const almost = { width: 2, height: 2, snake: [{ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }], heading: 'right', queue: ['down'], food: { x: 1, y: 1 }, score: 0, status: 'running' };
  assert.equal(step(almost, zero).status, 'won');
});

test('speed: a little faster per meal, with a floor', () => {
  assert.equal(stepInterval(0), 160);
  assert.ok(stepInterval(10) < stepInterval(0));
  assert.equal(stepInterval(1000), 75);
});

test('best score: the higher one, and junk from storage counts as none', () => {
  assert.equal(bestOf(12, 7), 12);
  assert.equal(bestOf(3, 7), 7);
  for (const junk of [null, undefined, '99', -4, 1.5, NaN, {}]) assert.equal(bestOf(junk, 5), 5, String(junk));
});

test('input: arrows and WASD by physical key, swipes need a clear direction', () => {
  assert.equal(keyDirection('ArrowUp'), 'up');
  assert.equal(keyDirection('KeyA'), 'left');
  assert.equal(keyDirection('KeyS'), 'down');
  assert.equal(keyDirection('KeyD'), 'right');
  assert.equal(keyDirection('KeyQ'), null);
  assert.equal(swipeDirection(40, 5), 'right');
  assert.equal(swipeDirection(-3, -60), 'up');
  assert.equal(swipeDirection(10, 8), null, 'a tap');
  assert.equal(swipeDirection(40, 38), null, 'diagonal: ambiguous');
});
