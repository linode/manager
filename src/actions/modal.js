import { EmitEvent } from 'linode-components';

export const SHOW_MODAL = '@@modal/SHOW_MODAL';
export const HIDE_MODAL = '@@modal/HIDE_MODAL';

export function showModal(title) {
  EmitEvent('modal:show', 'Modal', 'show');
  return { type: SHOW_MODAL, title };
}

export function hideModal() {
  return { type: HIDE_MODAL };
}
