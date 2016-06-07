export const CHANGE_DETAIL_TAB = '@@linodes@@detail/CHANGE_DETAIL_TAB';

export function changeDetailTab(index) {
  return { type: CHANGE_DETAIL_TAB, index };
}
