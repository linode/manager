export const SHOW_SESSION = '@@modal/SHOW_SESSION';
export const HIDE_SESSION = '@@modal/HIDE_SESSION';

export function showSession() {
  return { type: SHOW_SESSION };
}

export function hideSession() {
  return { type: HIDE_SESSION };
}
