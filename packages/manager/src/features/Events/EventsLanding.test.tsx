import React from 'react';

import { eventFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EventsLanding } from './EventsLanding';

describe('EventsLanding', () => {
  it('renders an empty state', async () => {
    server.use(
      rest.get('*/events', (req, res, ctx) =>
        res(ctx.json(makeResourcePage([])))
      )
    );

    const { findByText } = renderWithTheme(<EventsLanding />);

    await findByText("You don't have any events on your account.");
  });
  it('renders a custom empty state message', async () => {
    server.use(
      rest.get('*/events', (req, res, ctx) =>
        res(ctx.json(makeResourcePage([])))
      )
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
      rest.get('*/events', (req, res, ctx) =>
        res(ctx.json(makeResourcePage([event])))
      )
    );

    const { findByText } = renderWithTheme(<EventsLanding />);

    await findByText('my-volume');
    await findByText('is being created by user.', { exact: false });
  });

  it('renders a message when there are no more events to load', async () => {
    const event = eventFactory.build();

    server.use(
      rest.get('*/events', (req, res, ctx) =>
        res(
          ctx.json(makeResourcePage([event], { page: 1, pages: 1, results: 1 }))
        )
      )
    );

    const { findByText } = renderWithTheme(<EventsLanding />);

    await findByText('No more events to show');
  });
});
