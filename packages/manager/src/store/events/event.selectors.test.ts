import { entityFactory, eventFactory } from 'src/factories/events';
import {
  isEventRelevantToLinode,
  isEventRelevantToLinodeAsSecondaryEntity,
  isPrimaryEntity,
  isSecondaryEntity,
} from './event.selectors';

describe('event selector helpers', () => {
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
});
