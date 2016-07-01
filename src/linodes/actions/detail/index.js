import { fetch } from '~/fetch';
import { UPDATE_LINODE } from '~/actions/api/linodes';

export const TOGGLE_EDIT_MODE = '@@linodes@@detail/TOGGLE_EDIT_MODE';
export const SET_LINODE_LABEL = '@@linodes@@detail/SET_LINODE_LABEL';
export const SET_LINODE_GROUP = '@@linodes@@detail/SET_LINODE_GROUP';
export const TOGGLE_LOADING = '@@linodes@@detail/TOGGLE_LOADING';
export const SET_ERRORS = '@@linodes@@detail/SET_ERRORS';

export function toggleEditMode() {
  return { type: TOGGLE_EDIT_MODE };
}

export function setLinodeLabel(label) {
  return { type: SET_LINODE_LABEL, label };
}

export function setLinodeGroup(group) {
  return { type: SET_LINODE_GROUP, group };
}

export function clearErrors() {
  return { type: SET_ERRORS, label: null, group: null, _: null };
}

export function commitChanges(id) {
  return async (dispatch, getState) => {
    const state = getState();
    const { label, group } = state.linodes.detail.index;
    const { token } = state.authentication;
    dispatch({ type: TOGGLE_LOADING });
    dispatch(clearErrors());
    try {
      const resp = await fetch(token, `/linodes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ label, group }),
      });
      const json = await resp.json();
      dispatch({ type: UPDATE_LINODE, linode: json });
      dispatch({ type: TOGGLE_LOADING });
      dispatch(toggleEditMode());
    } catch (resp) {
      if (resp.statusCode !== 400) {
        dispatch({ SET_ERRORS, _: `Error: ${resp.statusCode} ${resp.statusText}` });
      } else {
        const json = await resp.json();
        const reducer = f => (s, e) => {
          if (e.field === f) {
            return s ? [...s, e.reason] : [e.reason];
          }
          return s;
        };
        dispatch({
          type: SET_ERRORS,
          label: json.errors.reduce(reducer('label'), null),
          group: json.errors.reduce(reducer('group'), null),
          _: json.errors.reduce((s, e) => e.field ? s : [...s, e.reason], null),
        });
        dispatch({ type: TOGGLE_LOADING });
      }
    }
  };
}
