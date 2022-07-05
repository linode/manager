import { getEvents } from '@linode/api-v4';
import { shallow } from 'enzyme';
import * as React from 'react';
import { ActivitySummary } from './ActivitySummary';

const props = {
  linodeId: 123456,
  eventsFromRedux: [],
  inProgressEvents: [],
  mostRecentEventTime: '',
  classes: {
    root: '',
    header: '',
    viewMore: '',
  },
};
const component = shallow(<ActivitySummary {...props} />);

describe('ActivitySummary component', () => {
  it('should render', () => {
    expect(component).toHaveLength(1);
  });

  it.skip("should request the Linode's events on load", () => {
    const account = { getEvents };
    const mockGetEvents = jest.spyOn<any, any>(account, 'getEvents');
    expect(mockGetEvents).toHaveBeenCalledWith(
      {},
      { 'entity.id': 123456, 'entity.type': 'linode' }
    );
  });
});
