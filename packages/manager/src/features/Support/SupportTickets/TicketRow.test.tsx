import { render } from '@testing-library/react';
import * as React from 'react';
import { supportTicketFactory } from 'src/factories/support';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import TicketRow from './TicketRow';

const supportTicket = supportTicketFactory.build();

window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
});

describe('TicketList component', () => {
  it('should render', () => {
    const { getByTestId } = render(
      wrapWithTheme(
        <table>
          <tbody>
            <TicketRow ticket={supportTicket} />
          </tbody>
        </table>
      )
    );
    const ticketRow = getByTestId('ticket-row');
    expect(ticketRow).toBeInTheDocument();
  });
});
