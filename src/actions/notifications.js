export const SHOW_NOTIFICATIONS = '@@modal/SHOW_NOTIFICATIONS';
export const HIDE_NOTIFICATIONS = '@@modal/HIDE_NOTIFICATIONS';

export function showNotifications() {
  return { type: SHOW_NOTIFICATIONS };
}

export function hideNotifications() {
  return { type: HIDE_NOTIFICATIONS };
}
