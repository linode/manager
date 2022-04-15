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
    const component = renderWithTheme(<ActivitySummary {...props} />);
    expect(component).not.toBeNull();
  });
});
