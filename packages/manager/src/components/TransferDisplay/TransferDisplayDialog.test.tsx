import { fireEvent } from '@testing-library/react';
import React from 'react';

import {
  accountTransferFactory,
  accountTransferNoResourceFactory,
} from 'src/factories/account';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TransferDisplay } from './TransferDisplay';
import { NETWORK_TRANSFER_QUOTA_DOCS_LINKS } from './constants';

import type { TransferDataOptions } from './utils';

const mockTransferData: TransferDataOptions = accountTransferFactory.build();
const mockTransferDataNoResource: TransferDataOptions = accountTransferNoResourceFactory.build();

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

describe('TransferDisplayDialog', () => {
  it('renders the transfer display dialog with accessible doc links', async () => {
    mockServerQuery(mockTransferData);

    const { findByText, getAllByRole } = renderWithTheme(<TransferDisplay />);
    const transferButton = await findByText(transferDisplayButtonSubstring);
    fireEvent.click(transferButton);

    const docsLinks = getAllByRole('link');

    expect(docsLinks.length).toBe(2);
    docsLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', NETWORK_TRANSFER_QUOTA_DOCS_LINKS);
    });
  });

  it('renders transfer display dialog without usage or quota data if no quota/resources', async () => {
    mockServerQuery(mockTransferDataNoResource);

    const { findByText, getByTestId } = renderWithTheme(<TransferDisplay />);
    const transferButton = await findByText(transferDisplayButtonSubstring);
    fireEvent.click(transferButton);

    const transferDialog = getByTestId('drawer');
    expect(transferDialog).toBeInTheDocument();
    expect(transferDialog).toHaveTextContent(
      /Your monthly network transfer will be shown when you create a resource./
    );
  });

  it('renders pool transfer headers', async () => {
    mockServerQuery({ ...mockTransferData });

    const { findByText, getByTestId } = renderWithTheme(<TransferDisplay />);
    const transferButton = await findByText(transferDisplayButtonSubstring);
    fireEvent.click(transferButton);

    expect(getByTestId('general-transfer-pool-display')).toBeInTheDocument();
    expect(getByTestId('region-transfer-pool-display')).toBeInTheDocument();
  });
});
