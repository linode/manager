import { within } from '@testing-library/react';
import { DateTime } from 'luxon';
import React from 'react';

import { eventFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme, resizeScreenSize } from 'src/utilities/testHelpers';

import { EventsLanding } from './EventsLanding';

describe('EventsLanding', () => {
  it('renders an empty state', async () => {
    server.use(
      http.get('*/events', () => HttpResponse.json(makeResourcePage([])))
    );

    const { findByText } = renderWithTheme(<EventsLanding />);

    await findByText("You don't have any events on your account.");
  });
  it('renders a custom empty state message', async () => {
    server.use(
      http.get('*/events', () => HttpResponse.json(makeResourcePage([])))
    );

    const emptyMessage = 'No Linode Events :(';

    const { findByText } = renderWithTheme(
      <EventsLanding emptyMessage={emptyMessage} />
    );

    await findByText(emptyMessage);
  });

  it('renders an event from the API', async () => {
    const event = eventFactory.build({
      action: 'volume_create',
      entity: {
        label: 'my-volume',
        type: 'volume',
      },
      username: 'user',
    });

    server.use(
      http.get('*/events', () => HttpResponse.json(makeResourcePage([event])))
    );

    const { findByRole } = renderWithTheme(<EventsLanding />);

    const messageCell = await findByRole('cell', {
      name: /volume.*my-volume.*is being.*created/i,
    });

    expect(messageCell).toHaveTextContent(/volume/i);
    expect(messageCell).toHaveTextContent(/my-volume/i);
    expect(messageCell).toHaveTextContent(/is being/i);
    expect(messageCell).toHaveTextContent(/created/i);

    const volumeLink = await findByRole('link', { name: /my-volume/i });
    expect(volumeLink).toHaveAttribute('href', '/volumes');
  });

  it('renders a message when there are no more events to load', async () => {
    const event = eventFactory.build();
    const eventsResponse = makeResourcePage([event], {
      page: 1,
      pages: 1,
      results: 1,
    });

    server.use(
      http.get('*/events', () => HttpResponse.json(eventsResponse), {
        once: true,
      }),
      // `useEventsInfiniteQuery` needs to make two fetches to know if there are no more events to show
      http.get('*/events', () => HttpResponse.json(makeResourcePage([])), {
        once: true,
      })
    );

    const { findByText } = renderWithTheme(<EventsLanding />);

    await findByText('No more events to show');
  });

  it('displays the data chronologically', async () => {
    resizeScreenSize(1600);
    const mockEvent1 = eventFactory.build({
      action: 'linode_migrate',
      created: DateTime.local().minus({ minutes: 1 }).toISO(),
      duration: 30,
      entity: {
        id: 1,
        label: 'linode-1',
      },
      status: 'finished',
    });

    const mockEvent2 = eventFactory.build({
      action: 'firewall_device_add',
      created: DateTime.local().minus({ minutes: 2 }).toISO(),
      entity: {
        id: 2,
        label: 'firewall-1',
        type: 'firewall',
      },
      secondary_entity: {
        id: 1,
        label: 'linode-1',
        type: 'linode',
      },
      status: 'notification',
    });

    const eventsResponse = makeResourcePage([mockEvent1, mockEvent2], {
      page: 1,
      pages: 1,
      results: 1,
    });

    server.use(
      http.get('*/events', () => HttpResponse.json(eventsResponse), {
        once: true,
      }),
      // `useEventsInfiniteQuery` needs to make two fetches to know if there are no more events to show
      http.get('*/events', () => HttpResponse.json(makeResourcePage([])), {
        once: true,
      })
    );

    const { findByRole, findByText } = renderWithTheme(<EventsLanding />);
    await findByText('No more events to show');

    const table = await findByRole('table');
    const tableBodyRows = within(table).getAllByRole('row').slice(1);
    expect(tableBodyRows.length).toEqual(2);

    const dates = tableBodyRows.map((row) => {
      const cells = within(row).getAllByRole('cell');
      return cells[3].textContent || '';
    });

    // util function to check if the dates are in descending order
    const areDatesSorted = dates.every(
      (date, i, arr) => i === 0 || new Date(arr[i - 1]) >= new Date(date)
    );

    expect(areDatesSorted).toBe(true);
  });
});
