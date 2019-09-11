import { shallow } from 'enzyme';
import * as React from 'react';
import { ActivitySummary } from './ActivitySummary';

const requests = require.requireMock('linode-js-sdk/lib/account');

requests.getEvents = jest.fn(() => Promise.resolve([]));

jest.mock('linode-js-sdk/lib/account', () => ({
  getEvents: () => jest.fn()
}));

const props = {
  linodeId: 123456,
  eventsFromRedux: [],
  inProgressEvents: [],
  mostRecentEventTime: '',
  classes: {
    root: '',
    header: '',
    viewMore: ''
  }
};
const component = shallow(<ActivitySummary {...props} />);

describe('ActivitySummary component', () => {
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
