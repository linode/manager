import { fetch } from '~/fetch';
import { UPDATE_LINODE } from '~/actions/api/linodes';

export const CHANGE_DETAIL_TAB = '@@linodes@@detail/CHANGE_DETAIL_TAB';
export const TOGGLE_EDIT_MODE = '@@linodes@@detail/TOGGLE_EDIT_MODE';
export const SET_LINODE_LABEL = '@@linodes@@detail/SET_LINODE_LABEL';
export const SET_LINODE_GROUP = '@@linodes@@detail/SET_LINODE_GROUP';

export function changeDetailTab(index) {
  return { type: CHANGE_DETAIL_TAB, index };
}

export function toggleEditMode() {
  return { type: TOGGLE_EDIT_MODE };
}

export function setLinodeLabel(label) {
  return { type: SET_LINODE_LABEL, label };
}

export function setLinodeGroup(group) {
  return { type: SET_LINODE_GROUP, group };
}

export function commitChanges(id) {
  return async (dispatch, getState) => {
    const state = getState();
    const { label, group } = state.linodes.detail;
    const { token } = state.authentication;
    // TODO: Dispatch some sort of pending state
    // TODO: Error handling
    const resp = await fetch(token, `/linodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ label, group }),
    });
    const json = await resp.json();
    dispatch({ type: UPDATE_LINODE, linode: json });
    dispatch(toggleEditMode());
  };
}
