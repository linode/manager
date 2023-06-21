import { vi } from 'vitest';
import { render } from '@testing-library/react';
import * as React from 'react';
import { supportTicketFactory } from 'src/factories/support';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { TicketRow } from './TicketRow';

const supportTicket = supportTicketFactory.build();

window.matchMedia = vi.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
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
