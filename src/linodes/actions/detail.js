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

export function commitChanges() {
  // TODO
}
