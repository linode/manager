import { render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { supportTicket } from 'src/__data__/supportTicket';
import TicketRow from './TicketRow';

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
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
