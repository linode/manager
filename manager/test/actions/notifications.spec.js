import { expect } from 'chai';
import {
  SHOW_NOTIFICATIONS,
  HIDE_NOTIFICATIONS,
  showNotifications,
  hideNotifications,
} from '~/actions/notifications';

describe('actions/notifications', () => {
  it('should return show notifications action', () => {
    const f = showNotifications();

    expect(f.type).to.equal(SHOW_NOTIFICATIONS);
  });

  it('should return hide notifications action', () => {
    const f = hideNotifications();

    expect(f.type).to.equal(HIDE_NOTIFICATIONS);
  });
});
