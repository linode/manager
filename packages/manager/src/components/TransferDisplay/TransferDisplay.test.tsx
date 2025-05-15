import { fireEvent } from '@testing-library/react';
import React from 'react';

import { accountTransferFactory } from 'src/factories/account';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  TRANSFER_DISPLAY_BUTTON,
  TRANSFER_DISPLAY_GENERAL_POOL,
} from './constants';
import { TransferDisplay } from './TransferDisplay';

import type { TransferDataOptions } from './utils';

const mockTransferData: TransferDataOptions = accountTransferFactory.build();

const mockServerQuery = (data: TransferDataOptions) => {
  if (!data) {
    return;
  }

  server.use(
    http.get('*/account/transfer', () => {
      return HttpResponse.json(data);
    })
  );
};

describe('TransferDisplay', () => {
  it('display the loading state', async () => {
    mockServerQuery(undefined);

    const { findByText } = renderWithTheme(<TransferDisplay />);
    const loadingText = await findByText('Loading transfer data...');
    expect(loadingText).toBeInTheDocument();
  });

  it('renders transfer display text and opens the transfer dialog on click', async () => {
    mockServerQuery(mockTransferData);

    const { findByText, getAllByTestId, getByTestId } = renderWithTheme(
      <TransferDisplay />
    );
    const transferButton = await findByText(TRANSFER_DISPLAY_BUTTON, {
      exact: false,
    });

    expect(transferButton).toBeInTheDocument();
    expect(
      await findByText(TRANSFER_DISPLAY_GENERAL_POOL, { exact: false })
    ).toBeInTheDocument();

    const transferPoolPctDisplays = getAllByTestId('transfer-pool-pct-display');
    expect(transferPoolPctDisplays.length).toBe(3);

    fireEvent.click(transferButton);
    const transferDialog = getByTestId('drawer');
    expect(transferDialog).toBeInTheDocument();
  });

  it('renders transfer display text with a percentage of 0.00% if no usage', async () => {
    mockServerQuery({ ...mockTransferData, used: 0 });

    const { findByText } = renderWithTheme(<TransferDisplay />);
    const usage = await findByText(TRANSFER_DISPLAY_GENERAL_POOL, {
      exact: false,
    });

    expect(usage.innerHTML).toMatch(/0.00%/);
  });
});
