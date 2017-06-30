import { EmitEvent } from 'linode-components/utils';

export const SHOW_MODAL = '@@modal/SHOW_MODAL';
export const HIDE_MODAL = '@@modal/HIDE_MODAL';

export function showModal(title, body) {
<<<<<<< c7535c24a36c05142dc2aa79dc930d95246d4d88
  EmitEvent('modal:show', 'Modal', 'show', title);
=======
  EmitEvent('Modal', 'show', title);
>>>>>>> rename TrackEvent to EmitEvent
  return { type: SHOW_MODAL, title, body };
}

export function hideModal() {
  return { type: HIDE_MODAL };
}
