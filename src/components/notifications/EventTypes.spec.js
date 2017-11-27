import {
  EventTypeMap,
  baseRedirect,
  getLinodeRedirectUrl,
  getLinodeAdvancedRedirectUrl,
  getLinodeBackupRedirectUrl,
} from '~/components/notifications';
import { api } from '~/data';

const events = api.events;

describe('components/notifications/EventTypes', () => {
  it('should define a type map', () => {
    expect(EventTypeMap).toBeDefined();
    expect(typeof EventTypeMap).toBe('object');
  });

  it('should provide a base redirect url', () => {
    expect(baseRedirect()).toBe('/');
  });

  it('should create a linode redirect url', () => {
    const event = events.events[385];
    expect(getLinodeRedirectUrl(event.entity)).toBe('/linodes/linode-www2');
  });

  it('should create a disk redirect url', () => {
    const event = events.events[385];
    expect(getLinodeAdvancedRedirectUrl(event.entity))
      .toBe('/linodes/linode-www2/settings/advanced');
  });

  it('should create a backups redirect url', () => {
    const event = events.events[385];
    expect(getLinodeBackupRedirectUrl(event.entity)).toBe('/linodes/linode-www2/backups');
  });
});
