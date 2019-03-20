import * as React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';

import { events } from 'src/__data__/events';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserEventsList } from './UserEventsList';

const props = {
  events,
  closeMenu: jest.fn(),
  ...reactRouterProps
};

afterEach(cleanup);

describe('UserEventsList component', () => {
  it('should display a View All Events link', () => {
    const { getByText } = renderWithTheme(<UserEventsList {...props} />);
    expect(getByText(/view all events/i)).toBeTruthy();
  });

  it('should redirect to /events when View All Events is clicked', () => {
    const { getByText } = renderWithTheme(<UserEventsList {...props} />);
    const viewAllLink = getByText(/view all events/i);
    fireEvent.click(viewAllLink);
    expect(reactRouterProps.history.push).toHaveBeenCalledWith('/events');
    expect(props.closeMenu).toHaveBeenCalledTimes(1);
  });
});
