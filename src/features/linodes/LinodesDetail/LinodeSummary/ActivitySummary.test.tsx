import { shallow } from 'enzyme';
import * as React from 'react';
import {
  ActivitySummary,
  filterUniqueEvents,
  percentCompleteHasUpdated
} from './ActivitySummary';

import { dupeEvents, uniqueEvents } from 'src/__data__/events';

const requests = require.requireMock('src/services/account');

requests.getEvents = jest.fn(() => Promise.resolve([]));

jest.mock('src/services/account', () => ({
  getEvents: () => jest.fn()
}));

const props = {
  linodeId: 123456,
  eventsFromRedux: [],
  inProgressEvents: [],
  classes: {
    root: '',
    header: '',
    viewMore: ''
  }
};
const component = shallow(<ActivitySummary {...props} />);

describe('ActivitySummary component', () => {
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

  it('should render', () => {
    expect(component).toHaveLength(1);
  });

  it("should request the Linode's events on load", () => {
    expect(requests.getEvents).toHaveBeenCalledWith(
      {},
      { 'entity.id': 123456, 'entity.type': 'linode' }
    );
  });
});
