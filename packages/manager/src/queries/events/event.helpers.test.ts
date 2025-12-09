import { entityFactory, eventFactory } from 'src/factories/events';

import {
  doesEventMatchAPIFilter,
  generateInFilter,
  generateNeqFilter,
  generatePollingFilter,
  getExistingEventDataForPollingFilterGenerator,
  isEventRelevantToLinode,
  isEventRelevantToLinodeAsSecondaryEntity,
  isInProgressEvent,
  isPrimaryEntity,
  isSecondaryEntity,
} from './event.helpers';

describe('isInProgressEvent', () => {
  it('should return true', () => {
    const event = eventFactory.build({ percent_complete: 60 });
    const result = isInProgressEvent(event);
    expect(result).toBeTruthy();
  });

  it('should return false', () => {
    const event = eventFactory.build({ percent_complete: 100 });
    const result = isInProgressEvent(event);
    expect(result).toBeFalsy();
  });
});

describe('isEventRelevantToLinode', () => {
  const event0 = eventFactory.build({
    action: 'linode_create',
    entity: entityFactory.build({ id: 0 }),
  });
  const event1 = eventFactory.build({
    action: 'linode_create',
    entity: entityFactory.build({ id: 1 }),
  });
  const event2 = eventFactory.build({
    action: 'linode_create',
    entity: entityFactory.build({ id: 100 }),
    secondary_entity: entityFactory.build({ id: 1 }),
  });
  const event3 = eventFactory.build({
    action: 'linode_clone',
    secondary_entity: entityFactory.build({ id: 1 }),
  });
  it("returns `true` when the linodeId is the event's entity ID, or if it's the event's secondary_entity ID and the event is relevant", () => {
    expect(isEventRelevantToLinode(event0, 0)).toBe(true);
    expect(isEventRelevantToLinode(event1, 0)).toBe(false);
    expect(isEventRelevantToLinode(event2, 1)).toBe(false);
    expect(isEventRelevantToLinode(event3, 1)).toBe(true);
  });
});

describe('isPrimaryEntity', () => {
  const event = eventFactory.build({
    entity: entityFactory.build({ id: 1 }),
  });
  it("returns `true` when the linodeId matches the event's entity ID", () => {
    expect(isPrimaryEntity(event, 0)).toBe(false);
    expect(isPrimaryEntity(event, 1)).toBe(true);
  });
});

describe('isSecondaryEntity', () => {
  const event = eventFactory.build({
    secondary_entity: entityFactory.build({ id: 1 }),
  });
  it("returns `true` when the linodeId matches the event's secondary_entity ID", () => {
    expect(isSecondaryEntity(event, 0)).toBe(false);
    expect(isSecondaryEntity(event, 1)).toBe(true);
  });
});

describe('isEventRelevantToLinodeAsSecondaryEntity', () => {
  const linodeCreateEvent = eventFactory.build({
    action: 'linode_create',
  });
  const linodeCloneEvent = eventFactory.build({
    action: 'linode_clone',
  });
  it('returns `true` if the event type is relevant to Linodes as secondary entities', () => {
    expect(isEventRelevantToLinodeAsSecondaryEntity(linodeCreateEvent)).toBe(
      false
    );
    expect(isEventRelevantToLinodeAsSecondaryEntity(linodeCloneEvent)).toBe(
      true
    );
  });
});

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

  it('should return true because the incoming entity matches the API filter', () => {
    const event = eventFactory.build({ entity: { id: 1, type: 'linode' } });
    const filter = { 'entity.id': 1, 'entity.type': 'linode' };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(true);
  });

  it('should return false because the incoming event does not match the API filter', () => {
    const event = eventFactory.build({ entity: { id: 1, type: 'linode' } });
    const filter = { 'entity.id': 2, 'entity.type': 'linode' };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(false);
  });

  it('should return false because the incoming event does not match the API filter', () => {
    const event = eventFactory.build({ entity: null });
    const filter = { 'entity.id': 2, 'entity.type': 'linode' };

    expect(doesEventMatchAPIFilter(event, filter)).toBe(false);
  });
});

describe('requestFilters', () => {
  describe('generateInFilter', () => {
    it('generates a filter from an array of values', () => {
      const result = generateInFilter('id', [1, 2, 3]);
      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe('generateNeqFilter', () => {
    it('generates +neq filter from key and array of values', () => {
      const result = generateNeqFilter('id', [1, 2, 3]);
      expect(result).toEqual([
        { id: { '+neq': 1 } },
        { id: { '+neq': 2 } },
        { id: { '+neq': 3 } },
      ]);
    });
  });

  describe('generatePollingFilter', () => {
    const timestamp = '2020-01-01T00:00:00';

    it('generates a simple filter when pollIDs is empty', () => {
      const result = generatePollingFilter(timestamp, []);
      expect(result).toEqual({
        '+order': 'desc',
        '+order_by': 'id',
        action: { '+neq': 'profile_update' },
        created: { '+gte': timestamp },
      });
    });

    it('handles "in" IDs', () => {
      const inIds = [1, 2, 3];
      const result = generatePollingFilter(timestamp, inIds);
      expect(result).toEqual({
        '+or': [
          { created: { '+gte': timestamp } },
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ],
        '+order': 'desc',
        '+order_by': 'id',
        action: { '+neq': 'profile_update' },
      });
    });

    it('handles "+neq" IDs', () => {
      const result = generatePollingFilter(timestamp, [], [1, 2, 3]);
      expect(result).toEqual({
        '+order': 'desc',
        '+order_by': 'id',
        action: { '+neq': 'profile_update' },
        '+and': [
          { created: { '+gte': timestamp } },
          { id: { '+neq': 1 } },
          { id: { '+neq': 2 } },
          { id: { '+neq': 3 } },
        ],
      });
    });

    it('handles "in" and "+neq" IDs together', () => {
      const result = generatePollingFilter(timestamp, [1, 2, 3], [4, 5, 6]);
      expect(result).toEqual({
        '+order': 'desc',
        '+order_by': 'id',
        action: { '+neq': 'profile_update' },
        '+or': [
          {
            '+and': [
              { created: { '+gte': timestamp } },
              { id: { '+neq': 4 } },
              { id: { '+neq': 5 } },
              { id: { '+neq': 6 } },
            ],
          },
          { id: 1 },
          { id: 2 },
          { id: 3 },
        ],
      });
    });
  });
});

describe('getExistingEventDataForPollingFilterGenerator', () => {
  it('returns the IDs in-progress of events', () => {
    const inProgressEvent = eventFactory.build({
      percent_complete: 5,
      status: 'started',
    });
    const eventThatIsNotInProgress = eventFactory.build({
      percent_complete: null,
      status: 'finished',
    });

    const { inProgressEvents } = getExistingEventDataForPollingFilterGenerator(
      [eventThatIsNotInProgress, inProgressEvent],
      ''
    );

    expect(inProgressEvents).toHaveLength(1);
    expect(inProgressEvents[0]).toBe(inProgressEvent.id);
  });

  it('returns the IDs of events with the same timestamp', () => {
    const timestamp = '2024-01-05T19:28:19';

    const eventWithSameTimestamp = eventFactory.build({
      created: timestamp,
      percent_complete: null,
      status: 'finished',
    });
    const eventWithDifferentTimestamp = eventFactory.build({
      created: '2024-01-01T18:28:19',
      percent_complete: null,
      status: 'finished',
    });

    const { eventsThatAlreadyHappenedAtTheFilterTime } =
      getExistingEventDataForPollingFilterGenerator(
        [eventWithDifferentTimestamp, eventWithSameTimestamp],
        timestamp
      );

    expect(eventsThatAlreadyHappenedAtTheFilterTime).toHaveLength(1);
    expect(eventsThatAlreadyHappenedAtTheFilterTime[0]).toBe(
      eventWithSameTimestamp.id
    );
  });

  it('will return an in-progress event in `inProgressEvents` and not in `eventsThatAlreadyHappenedAtTheFilterTime` even if it happened same second', () => {
    // we want this behavior because we want to keep polling in-progress events always
    const timestamp = '2024-01-05T19:28:19';

    const eventWithSameTimestamp = eventFactory.build({
      created: timestamp,
      percent_complete: 5,
      status: 'started',
    });

    const { eventsThatAlreadyHappenedAtTheFilterTime, inProgressEvents } =
      getExistingEventDataForPollingFilterGenerator(
        [eventWithSameTimestamp],
        timestamp
      );

    expect(eventsThatAlreadyHappenedAtTheFilterTime).toHaveLength(0);
    expect(inProgressEvents).toHaveLength(1);
  });
});
