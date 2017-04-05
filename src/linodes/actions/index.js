export const TOGGLE_SELECTED = '@@linodes@@index/TOGGLE_SELECTED';

export function toggleSelected(id) {
  const selected = Array.isArray(id) ? id : [id];
  return { type: TOGGLE_SELECTED, selected };
}

// TODO: may be appropriate to remove, depending on filtering/pagination
export function toggleSelectAll() {
  return async (dispatch, getState) => {
    const ids = getState().api.linodes.ids;
    dispatch({ type: TOGGLE_SELECTED, selected: ids });
  };
}
