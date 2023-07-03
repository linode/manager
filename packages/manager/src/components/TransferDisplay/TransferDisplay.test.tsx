import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { fireEvent } from '@testing-library/react';
import { TransferDisplay } from './TransferDisplay';
import { QueryClient } from 'react-query';

const MockData = {
  used: 0,
  quota: 0,
  billable: 0,
};

const transferDisplayPercentageSubstring = /You have used \d+\.\d\d%/;
const transferDisplayButtonSubstring = /Monthly Network Transfer Pool/;

jest.mock('../../queries/accountTransfer', () => {
  return {
    useAccountTransfer: jest.fn(() => {
      return { data: MockData };
    }),
  };
});

describe('TransferDisplay', () => {
  it('renders the MNTP button display text and opens the TransferDialog on click', async () => {
    const { getByText, getByTestId } = renderWithTheme(<TransferDisplay />, {
      queryClient: new QueryClient(),
    });

    expect(
      getByText(transferDisplayButtonSubstring, { exact: false })
    ).toBeInTheDocument();
    expect(
      getByText(transferDisplayPercentageSubstring, { exact: false })
    ).toBeInTheDocument();

    fireEvent.click(getByText(transferDisplayButtonSubstring));

    const transferDialog = getByTestId('drawer');
    expect(transferDialog).toBeInTheDocument();
  });

  it('displays a percentage of 0.00% for no usage', async () => {
    const { getByText } = renderWithTheme(<TransferDisplay />, {
      queryClient: new QueryClient(),
    });

    const usage = getByText(transferDisplayPercentageSubstring, {
      exact: false,
    }).innerHTML;
    expect(usage).toMatch(/0.00%/);
  });
});
