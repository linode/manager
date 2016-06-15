import { fetch } from '~/fetch';
import { UPDATE_LINODE } from '~/actions/api/linodes';

export const TOGGLE_EDIT_MODE = '@@linodes@@detail/TOGGLE_EDIT_MODE';
export const SET_LINODE_LABEL = '@@linodes@@detail/SET_LINODE_LABEL';
export const SET_LINODE_GROUP = '@@linodes@@detail/SET_LINODE_GROUP';
export const TOGGLE_LOADING = '@@linodes@@detail/TOGGLE_LOADING';

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
    const { label, group } = state.linodes.detail.index;
    const { token } = state.authentication;
    dispatch({ type: TOGGLE_LOADING });
    // TODO: Error handling
    const resp = await fetch(token, `/linodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ label, group }),
    });
    const json = await resp.json();
    dispatch({ type: UPDATE_LINODE, linode: json });
    dispatch({ type: TOGGLE_LOADING });
    dispatch(toggleEditMode());
  };
}
