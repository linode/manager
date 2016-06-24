export const CHANGE_SOURCE_TAB = '@@linodes@@create/CHANGE_SOURCE_TAB';
export const SELECT_SOURCE = '@@linodes@@create/SELECT_SOURCE';

export function changeSourceTab(tab) {
  return { type: CHANGE_SOURCE_TAB, tab };
}

export function selectSource(source) {
  return { type: SELECT_SOURCE, source };
}
