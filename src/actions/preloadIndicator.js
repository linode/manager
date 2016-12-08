export const PRELOAD_RESET = '@@preloadIndicator/PRELOAD_RESET';
export const PRELOAD_START = '@@preloadIndicator/PRELOAD_START';
export const PRELOAD_STOP = '@@preloadIndicator/PRELOAD_STOP';

export function preloadReset() {
  return { type: PRELOAD_RESET };
}

export function preloadStart() {
  return { type: PRELOAD_START };
}

export function preloadStop() {
  return { type: PRELOAD_STOP };
}
