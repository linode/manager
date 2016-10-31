export const SHOW_FEEDBACK = '@@modal/SHOW_FEEDBACK';
export const HIDE_FEEDBACK = '@@modal/HIDE_FEEDBACK';

export function showFeedback() {
  return { type: SHOW_FEEDBACK };
}

export function hideFeedback() {
  return { type: HIDE_FEEDBACK };
}
