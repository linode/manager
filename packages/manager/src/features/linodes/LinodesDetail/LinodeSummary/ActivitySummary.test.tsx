import { vi } from 'vitest';
import * as account from '@linode/api-v4/lib/account/events';
import { shallow } from 'enzyme';
import * as React from 'react';
import { ActivitySummary } from './ActivitySummary';

const mockGetEvents = vi.spyOn<any, any>(account, 'getEvents');

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

describe('ActivitySummary component', () => {
  it('should render', () => {
    const component = shallow(<ActivitySummary {...props} />);
    expect(component).toHaveLength(1);
  });

  it("should request the Linode's events on load", () => {
    expect(mockGetEvents).toHaveBeenCalledWith(
      {},
      { 'entity.id': 123456, 'entity.type': 'linode' }
    );
  });
});
