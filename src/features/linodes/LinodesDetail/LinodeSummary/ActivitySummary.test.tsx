import { shallow } from 'enzyme';
import * as React from 'react';

const requests = require.requireMock('src/services/account');

requests.getEvents = jest.fn(() => Promise.resolve([]));

jest.mock('src/services/account', () => ({
  getEvents: () => jest.fn()
}));

import { ActivitySummary } from './ActivitySummary';

const props = {
  linodeId: 123456,
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
