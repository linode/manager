import { fireEvent } from '@testing-library/react';
import React from 'react';

import { regionFactory } from 'src/factories';
import {
  accountTransferFactory,
  accountTransferNoResourceFactory,
} from 'src/factories/account';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  NETWORK_TRANSFER_USAGE_AND_COST_LINK,
  TRANSFER_DISPLAY_BUTTON,
} from './constants';
import { TransferDisplayDialog } from './TransferDisplayDialog';
import { calculatePoolUsagePct, getRegionTransferPools } from './utils';

import type { TransferDisplayDialogProps } from './TransferDisplayDialog';
import type { RegionalNetworkUtilization } from '@linode/api-v4';

const mockTransferData: RegionalNetworkUtilization = accountTransferFactory.build();
const mockTransferDataNoResource: RegionalNetworkUtilization = accountTransferNoResourceFactory.build();

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
    onClose: vi.fn(),
    regionTransferPools: getRegionTransferPools(
      mockData,
      regionFactory.buildList(3)
    ),
  };
};

describe('TransferDisplayDialog', () => {
  it('renders the transfer display dialog with accessible doc links', async () => {
    const { findByText, getByRole } = renderWithTheme(
      <TransferDisplayDialog
        {...transferDisplayDialogProps(mockTransferData)}
      />
    );
    const transferButton = await findByText(TRANSFER_DISPLAY_BUTTON);
    fireEvent.click(transferButton);

    const docsLink = getByRole('link');

    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute(
      'href',
      NETWORK_TRANSFER_USAGE_AND_COST_LINK
    );
  });

  it('renders transfer display dialog without usage or quota data if no quota/resources', async () => {
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
    const { findByText, getByTestId } = renderWithTheme(
      <TransferDisplayDialog
        {...transferDisplayDialogProps(mockTransferData)}
      />
    );
    const transferButton = await findByText(TRANSFER_DISPLAY_BUTTON);
    fireEvent.click(transferButton);

    expect(getByTestId('global-transfer-pool-header')).toBeInTheDocument();
    expect(getByTestId('other-transfer-pools-header')).toBeInTheDocument();
  });
});
