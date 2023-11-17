import React from 'react';

import {
  accountTransferFactory,
  linodeTransferFactory,
  regionFactory,
  regionWithDynamicPricingFactory,
} from 'src/factories';
import { typeFactory } from 'src/factories/types';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NetworkTransfer } from './NetworkTransfer';
import { calculatePercentageWithCeiling } from './utils';

vi.mock('src/hooks/useAPIRequest', () => ({
  useAPIRequest: vi.fn().mockReturnValue({
    data: linodeTransferFactory.build(),
    error: undefined,
    isLoading: false,
  }),
}));

vi.mock('src/queries/accountTransfer', () => ({
  useAccountTransfer: vi.fn().mockReturnValue({
    data: accountTransferFactory.build(),
    error: undefined,
    isLoading: false,
  }),
}));

vi.mock('src/queries/regions', () => {
  const mockRegions = [
    ...regionFactory.buildList(5),
    regionWithDynamicPricingFactory.build(),
  ];

  return {
    useRegionsQuery: vi.fn().mockReturnValue({
      data: mockRegions,
      error: undefined,
    }),
  };
});

vi.mock('src/queries/types', () => ({
  useTypeQuery: vi
    .fn()
    .mockReturnValue({ data: typeFactory.build(), error: undefined }),
}));

describe('calculatePercentage', () => {
  it('returns the correct percentage of a value in relation to a target', () => {
    expect(calculatePercentageWithCeiling(50, 100)).toBe(50);
    expect(calculatePercentageWithCeiling(50, 200)).toBe(25);
    expect(calculatePercentageWithCeiling(50, 50)).toBe(100);
  });
  it('caps the percentage at 100', () => {
    expect(calculatePercentageWithCeiling(101, 100)).toBe(100);
  });
});

describe('renders the component with the right data', () => {
  it('renders the component with the right data', () => {
    const { getByRole, getByText } = renderWithTheme(
      <NetworkTransfer
        linodeId={1234}
        linodeLabel="test-linode"
        linodeRegionId="us-east"
        linodeType="g6-standard-1"
      />
    );

    expect(getByText('Monthly Network Transfer')).toBeInTheDocument();
    expect(getByRole('progressbar')).toBeInTheDocument();
    expect(getByText('test-linode (0.01 GB - 1%)')).toBeInTheDocument();
    expect(getByText('Global Pool Used (9000 GB - 36%)')).toBeInTheDocument();
    expect(getByText('Global Pool Remaining (16000 GB)')).toBeInTheDocument();
  });

  it('renders the DC specific pricing copy for linodes in eligible regions', () => {
    const { getByRole, getByText } = renderWithTheme(
      <NetworkTransfer
        linodeId={1234}
        linodeLabel="test-linode"
        linodeRegionId="br-gru"
        linodeType="g6-standard-1"
      />
    );

    expect(getByText('Monthly Network Transfer')).toBeInTheDocument();
    expect(getByRole('progressbar')).toBeInTheDocument();
    expect(getByText('test-linode (83.8 GB - 1%)')).toBeInTheDocument();
    expect(getByText('Transfer Used (500 GB - 4%)')).toBeInTheDocument();
    expect(getByText('Transfer Remaining (14500 GB)')).toBeInTheDocument();
  });
});
