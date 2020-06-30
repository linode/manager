import { DateTime } from 'luxon';
import { shouldRequestNotifications } from './linodes.events';

describe('shouldRequestNotifications', () => {
  const d1 = '2019-05-23T12:00:00';
  const d2 = '2019-05-23T12:00:01';

  const d1InMilliseconds = DateTime.fromISO(d1, { zone: 'UTC' }).valueOf();
  const d2InMilliseconds = DateTime.fromISO(d2, { zone: 'UTC' }).valueOf();

  it('should return `true` if there is a linode_resize event created AFTER the last time notifications were updated', () => {
    expect(
      shouldRequestNotifications(d1InMilliseconds, 'linode_resize', d2)
    ).toBe(true);
  });

  it('should return `false` if there is a linode_resize event created BEFORE the last time notifications were updated', () => {
    expect(
      shouldRequestNotifications(d2InMilliseconds, 'linode_resize', d1)
    ).toBe(false);
  });

  it("should return `false` for events that aren't related to notifications", () => {
    expect(
      shouldRequestNotifications(d1InMilliseconds, 'linode_boot', d2)
    ).toBe(false);
    expect(
      shouldRequestNotifications(d1InMilliseconds, 'linode_update', d2)
    ).toBe(false);
  });
});
