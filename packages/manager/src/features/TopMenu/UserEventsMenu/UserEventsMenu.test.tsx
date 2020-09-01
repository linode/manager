import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import store from 'src/store';

import { events } from 'src/__data__/events';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserEventsMenu } from './UserEventsMenu';

const _createRange = window.document.createRange;

beforeAll(() => {
  // c/f https://github.com/mui-org/material-ui/issues/15726
  /* tslint:disable */
  window.document.createRange = () =>
    ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document
      }
    } as any);
  /* tslint:enable */
});

afterAll(() => {
  window.document.createRange = _createRange;
});

const props = {
  classes: {
    root: '',
    dropDown: '',
    viewAll: ''
  },
  events,
  store,
  markAllSeen: jest.fn(),
  ...(reactRouterProps as RouteComponentProps<any>)
};

describe('UserEventsList component', () => {
  it('should display a View All Events button', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <UserEventsMenu {...props} />
    );
    const button = getByTestId('ueb');
    fireEvent.click(button);
    expect(getByText(/all events/i)).toBeTruthy();
  });

  it('should redirect to /events when View All Events is clicked', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <UserEventsMenu {...props} />
    );
    const button = getByTestId('ueb');
    fireEvent.click(button);
    const viewAllLink = getByText(/view all events/i);
    fireEvent.click(viewAllLink);
    expect(reactRouterProps.history.push).toHaveBeenCalledWith('/events');
  });
});
