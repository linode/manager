export const SHOW_ACCOUNT = '@@modal/SHOW_ACCOUNT';
export const HIDE_ACCOUNT = '@@modal/HIDE_ACCOUNT';

export function showAccount() {
  return { type: SHOW_ACCOUNT };
}

export function hideAccount() {
  return { type: HIDE_ACCOUNT };
}
