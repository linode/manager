export const TOGGLE_SELECTED = '@@select/TOGGLE_SELECTED';

export default function toggleSelected(objectType, id) {
  const selectedIds = Array.isArray(id) ? id : [id];

  return {
    type: TOGGLE_SELECTED,
    objectType: objectType,
    selectedIds: selectedIds,
  };
}
