import * as React from 'react';
import { cleanup, fireEvent } from 'react-testing-library';
import store from 'src/store';

import { events } from 'src/__data__/events';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { renderWithTheme } from 'src/utilities/testHelpers';

import UserEventsMenu from './UserEventsMenu';

const props = {
  events,
  store,
  closeMenu: jest.fn(),
  ...reactRouterProps
};

afterEach(cleanup);

describe('UserEventsList component', () => {
  it.skip('should display a View All Events button', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <UserEventsMenu {...props} />
    );
    const button = getByTestId('ueb');
    fireEvent.click(button);
    expect(getByText(/all events/i)).toBeTruthy();
  });

  it.skip('should redirect to /events when View All Events is clicked', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <UserEventsMenu {...props} />
    );
    const button = getByTestId('ueb');
    fireEvent.click(button);
    const viewAllLink = getByText(/view all events/i);
    fireEvent.click(viewAllLink);
    expect(reactRouterProps.history.push).toHaveBeenCalledWith('/events');
    expect(props.closeMenu).toHaveBeenCalledTimes(1);
  });
});
