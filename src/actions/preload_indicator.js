export const PRELOAD_RESET = '@@preload_indicator/PRELOAD_RESET';
export const PRELOAD_START = '@@preload_indicator/PRELOAD_START';
export const PRELOAD_STOP = '@@preload_indicator/PRELOAD_STOP';

export function preloadReset() {
  return { type: PRELOAD_RESET };
}

export function preloadStart() {
  return { type: PRELOAD_START };
}

export function preloadStop() {
  return { type: PRELOAD_STOP };
}
