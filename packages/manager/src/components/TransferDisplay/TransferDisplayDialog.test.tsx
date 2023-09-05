import { fireEvent } from '@testing-library/react';
import React from 'react';

import { regionFactory } from 'src/factories';
import {
  accountTransferFactory,
  accountTransferNoResourceFactory,
} from 'src/factories/account';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TransferDisplayDialog } from './TransferDisplayDialog';
import {
  NETWORK_TRANSFER_QUOTA_DOCS_LINKS,
  TRANSFER_DISPLAY_BUTTON,
} from './constants';
import {
  calculatePoolUsagePct,
  getRegionTransferPools,
  mockServerQuery,
} from './utils';

import type { TransferDisplayDialogProps } from './TransferDisplayDialog';
import type { RegionalNetworkUtilization } from '@linode/api-v4';

const mockTransferData: RegionalNetworkUtilization = accountTransferFactory.build();
const mockTransferDataNoResource: RegionalNetworkUtilization = accountTransferNoResourceFactory.build();

jest.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    dcSpecificPricing: true,
  }),
}));

export const transferDisplayDialogProps = (
  mockData: RegionalNetworkUtilization
): TransferDisplayDialogProps => {
  if (!mockData) {
    return {} as TransferDisplayDialogProps;
  }

  return {
    generalPoolUsage: mockData,
    generalPoolUsagePct: calculatePoolUsagePct(mockData),
    isOpen: true,
    onClose: jest.fn(),
    regionTransferPools: getRegionTransferPools(
      mockData,
      regionFactory.buildList(3)
    ),
  };
};

describe('TransferDisplayDialog', () => {
  it('renders the transfer display dialog with accessible doc links', async () => {
    mockServerQuery(mockTransferData);

    const { findByText, getAllByRole } = renderWithTheme(
      <TransferDisplayDialog
        {...transferDisplayDialogProps(mockTransferData)}
      />
    );
    const transferButton = await findByText(TRANSFER_DISPLAY_BUTTON);
    fireEvent.click(transferButton);

    const docsLinks = getAllByRole('link');

    expect(docsLinks.length).toBe(2);
    docsLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', NETWORK_TRANSFER_QUOTA_DOCS_LINKS);
    });
  });

  it('renders transfer display dialog without usage or quota data if no quota/resources', async () => {
    mockServerQuery(mockTransferDataNoResource);

    const { findByText, getByTestId } = renderWithTheme(
      <TransferDisplayDialog
        {...transferDisplayDialogProps(mockTransferDataNoResource)}
      />
    );
    const transferButton = await findByText(TRANSFER_DISPLAY_BUTTON);
    fireEvent.click(transferButton);

    const transferDialog = getByTestId('drawer');
    expect(transferDialog).toBeInTheDocument();
    expect(transferDialog).toHaveTextContent(
      /Your monthly network transfer will be shown when you create a resource./
    );
  });

  it('renders pool transfer headers', async () => {
    mockServerQuery(mockTransferData);

    const { findByText, getByTestId } = renderWithTheme(
      <TransferDisplayDialog
        {...transferDisplayDialogProps(mockTransferData)}
      />
    );
    const transferButton = await findByText(TRANSFER_DISPLAY_BUTTON);
    fireEvent.click(transferButton);

    expect(getByTestId('general-transfer-pool-display')).toBeInTheDocument();
    expect(getByTestId('region-transfer-pool-display')).toBeInTheDocument();
  });
});
