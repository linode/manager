import { eventFactory } from 'src/factories';

import { doesEventMatchAPIFilter } from './events';

describe('doesEventMatchAPIFilter', () => {
  it('should return false if the API filter filters out profile_update events', () => {
    const event = eventFactory.build({ action: 'profile_update' });
    const filter = { action: { '+neq': 'profile_update' } };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(false);
  });

  it('should return false because this event does not meet the API filter criteria', () => {
    const event = eventFactory.build({
      action: 'profile_update',
      entity: null,
    });
    const filter = { 'entity.id': 2, 'entity.type': 'linode' };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(false);
  });

  it('should return true because linode_boot would be allowed by this event', () => {
    const event = eventFactory.build({ action: 'linode_boot' });
    const filter = { action: { '+neq': 'profile_update' } };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(true);
  });

  it('should return true because the incomming entity matches the API filter', () => {
    const event = eventFactory.build({ entity: { id: 1, type: 'linode' } });
    const filter = { 'entity.id': 1, 'entity.type': 'linode' };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(true);
  });

  it('should return false because the incomming event does not match the API filter', () => {
    const event = eventFactory.build({ entity: { id: 1, type: 'linode' } });
    const filter = { 'entity.id': 2, 'entity.type': 'linode' };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(false);
  });

  it('should return false because the incomming event does not match the API filter', () => {
    const event = eventFactory.build({ entity: null });
    const filter = { 'entity.id': 2, 'entity.type': 'linode' };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(false);
  });
});
