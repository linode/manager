import { fireEvent } from '@testing-library/react';
import React from 'react';

import { accountTransferFactory } from 'src/factories/account';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TransferDisplay } from './TransferDisplay';

import type { TransferDataOptions } from './utils';

const mockTransferData: TransferDataOptions = accountTransferFactory.build();

const transferDisplayButtonSubstring = /Monthly Network Transfer Pool/;

// Mock the useFlags hook
jest.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    dcSpecificPricing: true, // Mock the flag value
  }),
}));

const mockServerQuery = (data: TransferDataOptions) => {
  if (!data) {
    return;
  }

  server.use(
    rest.get('*/account/transfer', (req, res, ctx) => {
      return res(ctx.json(data));
    })
  );
};

describe('TransferDisplayDialogUsage', () => {
  it('renders general transfer & region transfer progress bars', async () => {
    mockServerQuery({ ...mockTransferData });

    const { findByText, getAllByRole, getByTestId } = renderWithTheme(
      <TransferDisplay />
    );
    const transferButton = await findByText(transferDisplayButtonSubstring);
    fireEvent.click(transferButton);

    const progressBars = getAllByRole('progressbar');

    expect(progressBars.length).toBe(3);
    expect(getByTestId('general-transfer-pool-display')).toBeInTheDocument();

    expect(await findByText('9000 GB Used (36%)')).toBeInTheDocument();
    expect(await findByText('8500 GB Used (85%)')).toBeInTheDocument();
    expect(await findByText('500 GB Used (3%)')).toBeInTheDocument();
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '36');
    expect(progressBars[1]).toHaveAttribute('aria-valuenow', '85');
    expect(progressBars[2]).toHaveAttribute('aria-valuenow', '4');
  });

  it('renders only one progress bar if entity does not have region transfers', async () => {
    mockServerQuery({ ...mockTransferData, region_transfers: [] });

    const { findByText, getAllByRole, getByTestId } = renderWithTheme(
      <TransferDisplay />
    );
    const transferButton = await findByText(transferDisplayButtonSubstring);
    fireEvent.click(transferButton);

    const progressBars = getAllByRole('progressbar');

    expect(getByTestId('general-transfer-pool-display')).toBeInTheDocument();
    expect(progressBars.length).toBe(1);
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '36');
  });
});
