export const CHANGE_VIEW = "@@linodes@@index/CHANGE_VIEW";
export const TOGGLE_SELECTED = "@@linodes@@index/TOGGLE_SELECTED";

export function changeView(view) {
  return { type: CHANGE_VIEW, view };
}

export function toggleSelected(id) {
  return { type: TOGGLE_SELECTED, selected: [id] };
}

export function toggleSelectAll() {
  return async (dispatch, getState) => {
    const linodes = Object.keys(getState().api.linodes.linodes);
    dispatch({ type: TOGGLE_SELECTED, selected: linodes });
  };
}
