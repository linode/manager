import { EmitEvent } from 'linode-components/utils';

export const SHOW_MODAL = '@@modal/SHOW_MODAL';
export const HIDE_MODAL = '@@modal/HIDE_MODAL';

export function showModal(title, body) {
  EmitEvent('modal:show', 'Modal', 'show', title);
  return { type: SHOW_MODAL, title, body };
}

export function hideModal() {
  return { type: HIDE_MODAL };
}
