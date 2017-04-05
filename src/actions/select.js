export const TOGGLE_SELECTED = '@@select/TOGGLE_SELECTED';

export default function toggleSelected(type, id) {
  const selectedIds = Array.isArray(id) ? id : [id];

  return {
    type: TOGGLE_SELECTED,
    objType: type,
    selectedIds: selectedIds,
  };
}
