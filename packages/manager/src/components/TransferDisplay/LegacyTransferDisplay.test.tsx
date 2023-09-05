// =================================================================================
// This is a copy of the original TransferDisplay test, which is getting deprecated.
// It can be safely deleted once the new TransferDisplay component
// is fully rolled out and the dcSpecificPricing flag is cleaned up.
// ==================================================================================

import { fireEvent } from '@testing-library/react';
import React from 'react';

import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TransferDisplay } from './TransferDisplay';
import { TRANSFER_DISPLAY_GENERAL_POOL } from './constants';

const MockData = {
  billable: 0,
  quota: 0,
  used: 0,
};

describe('TransferDisplay', () => {
  it('renders transfer display text and opens the transfer dialog, with GB data stats, on click', async () => {
    server.use(
      rest.get('*/account/transfer', (req, res, ctx) => {
        return res(
          ctx.json({
            billable: 0,
            quota: 11347,
            used: 50,
          })
        );
      })
    );

    const { findByText, getByTestId } = renderWithTheme(<TransferDisplay />);
    const transferButton = await findByText(TRANSFER_DISPLAY_GENERAL_POOL, {
      exact: false,
    });

    expect(transferButton).toBeInTheDocument();
    expect(
      await findByText(TRANSFER_DISPLAY_GENERAL_POOL, { exact: false })
    ).toBeInTheDocument();
    fireEvent.click(transferButton);

    const transferDialog = getByTestId('drawer');
    expect(transferDialog.innerHTML).toMatch(/GB/);
  });

  it('renders transfer display text with a percentage of 0.00% if no usage', async () => {
    server.use(
      rest.get('*/account/transfer', (req, res, ctx) => {
        return res(ctx.json(MockData));
      })
    );

    const { findByText } = renderWithTheme(<TransferDisplay />);
    const usage = await findByText(TRANSFER_DISPLAY_GENERAL_POOL, {
      exact: false,
    });

    expect(usage.innerHTML).toMatch(/0.00%/);
  });
});
