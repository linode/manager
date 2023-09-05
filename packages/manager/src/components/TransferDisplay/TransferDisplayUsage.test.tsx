import React from 'react';

import {
  accountTransferFactory,
  accountTransferNoResourceFactory,
} from 'src/factories/account';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TransferDisplayDialog } from './TransferDisplayDialog';
import { transferDisplayDialogProps } from './TransferDisplayDialog.test';
import { TransferDisplayUsage } from './TransferDisplayUsage';
import { calculatePoolUsagePct, mockServerQuery } from './utils';

import type { TransferDisplayUsageProps } from './TransferDisplayUsage';
import type { TransferDataOptions } from './utils';

const mockTransferData: TransferDataOptions = accountTransferFactory.build();

const transferDisplayUsageProps: TransferDisplayUsageProps = {
  pullUsagePct: calculatePoolUsagePct(mockTransferData),
  quota: mockTransferData.quota,
  used: mockTransferData.used,
};

jest.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    dcSpecificPricing: true,
  }),
}));

describe('TransferDisplayDialogUsage', () => {
  it('renders general transfer & region transfer progress bars', async () => {
    mockServerQuery({ ...mockTransferData });

    const { findByText, getAllByRole, getByTestId } = renderWithTheme(
      <TransferDisplayDialog {...transferDisplayDialogProps(mockTransferData)}>
        <TransferDisplayUsage {...transferDisplayUsageProps} />
      </TransferDisplayDialog>
    );
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

    const { getAllByRole, getByTestId } = renderWithTheme(
      <TransferDisplayDialog
        {...transferDisplayDialogProps({
          ...mockTransferData,
          region_transfers: [],
        })}
      >
        <TransferDisplayUsage {...transferDisplayUsageProps} />
      </TransferDisplayDialog>
    );

    const progressBars = getAllByRole('progressbar');

    expect(getByTestId('general-transfer-pool-display')).toBeInTheDocument();
    expect(progressBars.length).toBe(1);
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '36');
  });

  it('renders no progress bar if general pool has no quota', async () => {
    const mockTransferDataNoResource = accountTransferNoResourceFactory.build();
    mockServerQuery(mockTransferDataNoResource);

    const { queryByRole, queryByTestId } = renderWithTheme(
      <TransferDisplayDialog
        {...transferDisplayDialogProps(mockTransferDataNoResource)}
      >
        <TransferDisplayUsage {...transferDisplayUsageProps} />
      </TransferDisplayDialog>
    );

    const progressBar = queryByRole('progressbar');

    expect(
      queryByTestId('region-transfer-pool-display')
    ).not.toBeInTheDocument();
    expect(progressBar).not.toBeInTheDocument();
  });
});
