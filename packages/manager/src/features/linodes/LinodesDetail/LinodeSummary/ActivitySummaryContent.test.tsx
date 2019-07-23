import { shallow } from 'enzyme';
import * as React from 'react';

import { events } from 'src/__data__/events';

import { ActivitySummaryContent } from './ActivitySummaryContent';

const props = {
  loading: true,
  events: [],
  classes: {
    root: '',
    emptyState: ''
  }
};

const component = shallow(<ActivitySummaryContent {...props} />);

describe('ActivitySummaryContent', () => {
  it('should render a loading spinner when loading', () => {
    expect(component.find('[data-qa-activity-loading]')).toHaveLength(1);
  });

  it('should render an error state when there is an error', () => {
    component.setProps({ error: 'An error' });
    expect(component.find('[data-qa-activity-error]')).toHaveLength(1);
  });

  it('should render an empty state when there are no events', () => {
    component.setProps({ error: undefined, loading: false });
    expect(component.find('[data-qa-activity-empty]')).toHaveLength(1);
  });

  it('should render an ActivityRow for each event when there are events', () => {
    component.setProps({ events });
    expect(component.find('[data-qa-activity-row]')).toHaveLength(
      events.length
    );
  });
});
