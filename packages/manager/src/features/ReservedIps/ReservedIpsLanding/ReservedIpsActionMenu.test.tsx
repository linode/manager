import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { reservedIPsFactory } from 'src/factories/networking';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ReservedIpsActionMenu } from './ReservedIpsActionMenu';

import type { ReservedIpsActionHandlers } from './ReservedIpsActionMenu';

describe('ReservedIpsActionMenu', () => {
  const mockHandlers: ReservedIpsActionHandlers = {
    onEdit: vi.fn(),
    onUnreserve: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the action menu with the correct aria-label', () => {
    const ip = reservedIPsFactory.build({ address: '203.0.113.5' });

    const { getByLabelText } = renderWithTheme(
      <ReservedIpsActionMenu handlers={mockHandlers} ip={ip} />
    );

    expect(
      getByLabelText('Action menu for Reserved IP 203.0.113.5')
    ).toBeVisible();
  });

  it('calls onEdit when Edit is clicked', async () => {
    const ip = reservedIPsFactory.build();

    const { getByLabelText, getByText } = renderWithTheme(
      <ReservedIpsActionMenu handlers={mockHandlers} ip={ip} />
    );

    await userEvent.click(
      getByLabelText(`Action menu for Reserved IP ${ip.address}`)
    );
    await userEvent.click(getByText('Edit'));

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(ip);
  });

  it('calls onUnreserve when Unreserve is clicked', async () => {
    const ip = reservedIPsFactory.build();

    const { getByLabelText, getByText } = renderWithTheme(
      <ReservedIpsActionMenu handlers={mockHandlers} ip={ip} />
    );

    await userEvent.click(
      getByLabelText(`Action menu for Reserved IP ${ip.address}`)
    );
    await userEvent.click(getByText('Unreserve'));

    expect(mockHandlers.onUnreserve).toHaveBeenCalledWith(ip);
  });
});
