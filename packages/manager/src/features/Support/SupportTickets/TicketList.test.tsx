import { screen } from '@testing-library/react';
import * as React from 'react';
import { supportTicketFactory } from 'src/factories';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
import { pageyProps } from 'src/__data__/pageyProps';
import { CombinedProps, TicketList } from './TicketList';

const supportTickets = supportTicketFactory.buildList(5);

const mockPageChange = jest.fn();
const mockRequest = jest.fn();

const props: CombinedProps = {
  ...pageyProps,
  filterStatus: 'open',
  orderBy: '',
  data: supportTickets,
  handlePageChange: mockPageChange,
  request: mockRequest,
};

describe('TicketList', () => {
  it('renders loading state', () => {
    renderWithTheme(<TicketList {...props} loading={true} />);
    screen.getByTestId('table-row-loading');
  });

  it('renders error state', () => {
    renderWithTheme(
      <TicketList {...props} error={[{ reason: 'An error occurred.' }]} />
    );
    screen.getByText(/unable to load/);
  });

  it('contains a row for each Support Ticket', () => {
    renderWithTheme(<TicketList {...props} />);
    supportTickets.forEach((thisTicket) => {
      screen.getByText(thisTicket.summary);
    });
  });

  it('it resets to the first page when then filterStatus changes', async () => {
    const { rerender } = renderWithTheme(<TicketList {...props} />);
    rerender(wrapWithTheme(<TicketList {...props} filterStatus="closed" />));
    expect(mockPageChange).toHaveBeenCalledWith(1);
  });

  it('it calls its request function again when there is a new ticket', async () => {
    mockRequest.mockReset();
    const { rerender } = renderWithTheme(<TicketList {...props} />);
    rerender(
      wrapWithTheme(
        <TicketList {...props} newTicket={supportTicketFactory.build()} />
      )
    );
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });
});
