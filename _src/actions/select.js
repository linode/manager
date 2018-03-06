export const TOGGLE_SELECTED = '@@select/TOGGLE_SELECTED';
export const REMOVE_SELECTED = '@@select/REMOVE_SELECTED';

export default function toggleSelected(objectType, id) {
  const selectedIds = Array.isArray(id) ? id : [id];

  return {
    type: TOGGLE_SELECTED,
    objectType: objectType,
    selectedIds: selectedIds,
  };
}

export function removeSelected(objectType, id) {
  const selectedIds = Array.isArray(id) ? id : [id];

  return {
    type: REMOVE_SELECTED,
    objectType: objectType,
    selectedIds: selectedIds,
  };
}
