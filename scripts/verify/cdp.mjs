// A minimal Chrome DevTools Protocol driver for the verification scripts.
//
// No dependencies: Node's global fetch and WebSocket, and a locally installed
// Chrome. Set CHROME_PATH if Chrome is not at the Windows default location, and
// VERIFY_OUT to choose where screenshots and throwaway profiles go (default: the
// system temp directory). VERIFY_GPU=1 keeps Chrome's GPU path (compositing on
// the graphics card, as a visitor's browser does); by default it is disabled so
// screenshots are identical from run to run.
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export const OUT = process.env.VERIFY_OUT ?? path.join(tmpdir(), 'ahmados-verify');
mkdirSync(OUT, { recursive: true });

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VK = {
  Enter: 13, Tab: 9, Escape: 27, ' ': 32, ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39,
  Backspace: 8, PageDown: 34, PageUp: 33, End: 35, Home: 36, F3: 114,
};

/**
 * Launch headless Chrome with a fresh profile.
 * `touch`: emulate a touch phone (touch events, mobile viewport).
 */
export async function launch({ width, height, reduce = false, touch = false, tag = 'run' }) {
  const profile = path.join(OUT, `profile-${tag}`);
  let chrome;
  let wsUrl;
  // A previous run's Chrome can still hold its port or profile for a moment;
  // try a few fresh ports before giving up.
  for (let attempt = 0; attempt < 4 && !wsUrl; attempt++) {
    if (attempt > 0) await sleep(1500);
    const port = 9400 + Math.floor(Math.random() * 500);
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
    mkdirSync(profile, { recursive: true });
    chrome = spawn(
      CHROME,
      [
        '--headless=new', ...(process.env.VERIFY_GPU ? [] : ['--disable-gpu']), '--hide-scrollbars',
        `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
        `--window-size=${width},${height}`, 'about:blank',
      ],
      { stdio: 'ignore' },
    );
    for (let i = 0; i < 60 && !wsUrl; i++) {
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
        wsUrl = list.find((entry) => entry.type === 'page')?.webSocketDebuggerUrl;
      } catch {
        // Chrome is still starting.
      }
      if (!wsUrl) await sleep(200);
    }
    if (!wsUrl) chrome.kill();
  }
  if (!wsUrl) {
    throw new Error(`Chrome did not start. Check CHROME_PATH (${CHROME}) and that VERIFY_OUT (${OUT}) is writable.`);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method) {
      listeners.forEach((fn) => fn(msg));
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const n = ++id;
      pending.set(n, resolve);
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) {
      return { error: r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text };
    }
    const result = r.result?.result;
    // -0, NaN and Infinity come back only as unserializableValue.
    if (result && result.value === undefined && result.unserializableValue !== undefined) {
      return Number(result.unserializableValue);
    }
    return result?.value;
  };

  const errors = [];
  listeners.push((msg) => {
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push(msg.params.args.map((arg) => arg.value ?? arg.description).join(' '));
    }
  });

  const mobile = touch || width < 768;
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  if (touch) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }],
  });
  await send('Page.enable');
  await send('Runtime.enable');

  return {
    send,
    evaluate,
    errors,
    /** Listen for one DevTools event by method name (e.g. Tracing.dataCollected). */
    on(method, fn) {
      listeners.push((msg) => {
        if (msg.method === method) fn(msg);
      });
    },
    async goto(url, wait = 6000) {
      await send('Page.navigate', { url });
      await sleep(wait);
    },
    async reload(wait = 6000) {
      await send('Page.reload', { ignoreCache: false });
      await sleep(wait);
    },
    async shot(name) {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(r.result.data, 'base64'));
    },
    async key(key, text) {
      const code = key === ' ' ? 'Space' : key;
      const base = { key, code, windowsVirtualKeyCode: VK[key] ?? 0 };
      await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, ...(text ? { text } : {}) });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
    },
    async type(text) {
      await send('Input.insertText', { text });
    },
    async click(x, y) {
      if (touch) {
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        return;
      }
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    },
    async drag(from, to, steps = 12) {
      if (touch) {
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
        for (let i = 1; i <= steps; i++) {
          const point = { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps };
          await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point] });
          await sleep(16);
        }
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        return;
      }
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x, y: from.y });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', clickCount: 1 });
      for (let i = 1; i <= steps; i++) {
        const x = from.x + ((to.x - from.x) * i) / steps;
        const y = from.y + ((to.y - from.y) * i) / steps;
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'left', buttons: 1 });
        await sleep(16);
      }
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', clickCount: 1 });
    },
    async wheel(deltaY, x = width / 2, y = height / 2) {
      await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY });
    },
    /**
     * A real scroll gesture: a finger swipe on touch profiles, wheel notches
     * otherwise. Input.synthesizeScrollGesture is not used: in headless Chrome it
     * moves nothing at all, so checks built on it passed without scrolling.
     */
    async swipe(distance) {
      const x = Math.round(width / 2);
      if (touch) {
        const startY = Math.round(height * 0.8);
        const endY = Math.max(10, startY - Math.min(distance, height * 0.7));
        const steps = 10;
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY }] });
        for (let i = 1; i <= steps; i++) {
          const y = Math.round(startY + ((endY - startY) * i) / steps);
          await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
          await sleep(12);
        }
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        return;
      }
      const notch = 100;
      for (let moved = 0; moved < distance; moved += notch) {
        await send('Input.dispatchMouseEvent', {
          type: 'mouseWheel', x, y: Math.round(height / 2), deltaX: 0, deltaY: Math.min(notch, distance - moved),
        });
        await sleep(16);
      }
    },
    close() {
      ws.close();
      chrome.kill();
    },
  };
}
