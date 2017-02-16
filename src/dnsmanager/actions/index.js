export const TOGGLE_SELECTED = '@@zones@@index/TOGGLE_SELECTED';

export function toggleSelected(id) {
  return { type: TOGGLE_SELECTED, selected: [id] };
}

export function toggleSelectAll() {
  return async (dispatch, getState) => {
    const zones = Object.keys(getState().api.dnszones.dnszones);
    dispatch({ type: TOGGLE_SELECTED, selected: zones });
  };
}
