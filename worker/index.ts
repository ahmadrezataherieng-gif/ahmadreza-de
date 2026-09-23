/**
 * The Worker's entry: the anonymous counters live in `api.ts`.
 *
 * Workers treat every named export of the entry module as a handler, so this
 * file exports the handler and nothing else; the constants the tests read
 * stay in `api.ts`.
 */
import api from './api.ts';

export default api;
