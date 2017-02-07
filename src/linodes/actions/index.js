export const TOGGLE_SELECTED = '@@linodes@@index/TOGGLE_SELECTED';

export function toggleSelected(id) {
  return { type: TOGGLE_SELECTED, selected: [id] };
}

export function toggleSelectAll() {
  return async (dispatch, getState) => {
    const linodes = Object.keys(getState().api.linodes.linodes);
    dispatch({ type: TOGGLE_SELECTED, selected: linodes });
  };
}
