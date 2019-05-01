import { dupeEvents, uniqueEvents } from 'src/__data__/events';
import { filterUniqueEvents, percentCompleteHasUpdated } from './Event.helpers';

describe('Utility Functions', () => {
  it('should filter out unique events', () => {
    expect(filterUniqueEvents(dupeEvents)).toHaveLength(1);
    expect(filterUniqueEvents(uniqueEvents)).toHaveLength(2);
  });

  it('should return true if percent complete has changed', () => {
    const inProgressEvents: Record<number, number> = {
      123: 50
    };
    const prevInProgressEvents: Record<number, number> = {
      123: 79
    };
    expect(
      percentCompleteHasUpdated(inProgressEvents, inProgressEvents)
    ).toBeFalsy();
    expect(
      percentCompleteHasUpdated(inProgressEvents, prevInProgressEvents)
    ).toBeTruthy();
    expect(percentCompleteHasUpdated(inProgressEvents, {})).toBeTruthy();
  });
});
