const account = require('@linode/api-v4/lib/account/events');
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
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

describe('ActivitySummary component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<ActivitySummary {...props} />);
    expect(getByText('Activity Feed')).toBeInTheDocument();
  });

  it.skip("should request the Linode's events on load", () => {
    const mockGetEvents = jest.spyOn<any, any>(account, 'getEvents');
    renderWithTheme(<ActivitySummary {...props} />);
    expect(mockGetEvents).toHaveBeenCalledWith(
      {},
      { 'entity.id': 123456, 'entity.type': 'linode' }
    );
  });
});
