import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from '@tanstack/react-query';

import { supportTicketFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { Props, TicketList } from './TicketList';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const props: Props = {
  filterStatus: 'open',
};

const loadingTestId = 'table-row-loading';

describe('TicketList', () => {
  it('renders loading state', () => {
    renderWithTheme(<TicketList {...props} />);
    screen.getByTestId(loadingTestId);
  });

  it('should render ticket table containing tickets', async () => {
    server.use(
      rest.get('*/support/tickets', (req, res, ctx) => {
        const tickets = supportTicketFactory.buildList(1, {
          status: 'open',
          summary: 'my linode is broken :(',
        });
        return res(ctx.json(makeResourcePage(tickets)));
      })
    );

    const {
      getAllByText,
      getByTestId,
      queryAllByText,
    } = renderWithTheme(<TicketList filterStatus="open" />, { queryClient });

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Static text and table column headers
    getAllByText('Subject');
    getAllByText('Ticket ID');
    getAllByText('Regarding');
    getAllByText('Date Created');
    getAllByText('Last Updated');
    getAllByText('Updated By');

    // Check to see if the mocked API data rendered in the table
    queryAllByText('my linode is broken :(');
  });

  it('should render ticket list empty state', async () => {
    server.use(
      rest.get('*/support/tickets', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <TicketList filterStatus="open" />,
      {
        queryClient,
      }
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByText('No items to display.')).toBeInTheDocument();
  });
});
