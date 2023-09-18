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

const MockData = {
  billable: 0,
  quota: 0,
  used: 0,
};

const transferDisplayPercentageSubstring = /You have used \d+\.\d\d%/;
const transferDisplayButtonSubstring = /Monthly Network Transfer Pool/;
const docsLink = 'https://www.linode.com/docs/guides/network-transfer-quota/';

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
    const transferButton = await findByText(transferDisplayButtonSubstring, {
      exact: false,
    });

    expect(transferButton).toBeInTheDocument();
    expect(
      await findByText(transferDisplayPercentageSubstring, { exact: false })
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
    const usage = await findByText(transferDisplayPercentageSubstring, {
      exact: false,
    });

    expect(usage.innerHTML).toMatch(/0.00%/);
  });

  it('renders transfer display dialog without usage or quota data if no quota/resources', async () => {
    server.use(
      rest.get('*/account/transfer', (req, res, ctx) => {
        return res(ctx.json(MockData));
      })
    );

    const { findByText, getByTestId } = renderWithTheme(<TransferDisplay />);
    const transferButton = await findByText(transferDisplayButtonSubstring);
    fireEvent.click(transferButton);

    const transferDialog = getByTestId('drawer');
    expect(transferDialog.innerHTML).toMatch(
      /Your monthly network transfer will be shown when you create a resource./
    );
    expect(transferDialog.innerHTML).not.toMatch(/GB/);
  });

  it('renders the transfer display dialog with an accessible docs link', async () => {
    server.use(
      rest.get('*/account/transfer', (req, res, ctx) => {
        return res(ctx.json(MockData));
      })
    );

    const { findByText, getByRole } = renderWithTheme(<TransferDisplay />);
    const transferButton = await findByText(transferDisplayButtonSubstring);
    fireEvent.click(transferButton);

    expect(getByRole('link')).toHaveAttribute('href', docsLink);
    expect(getByRole('link').getAttribute('aria-label'));
  });
});
