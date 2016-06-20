export const SHOW_MODAL = '@@modal/SHOW_MODAL';
export const HIDE_MODAL = '@@modal/HIDE_MODAL';

export function showModal(title, body) {
  return { type: SHOW_MODAL, title, body };
}

export function hideModal(title, body) {
  return { type: HIDE_MODAL, title, body };
}
