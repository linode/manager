import { screen } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import { useComputePricing } from 'src/utilities/pricing/useComputePricing';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ExplainerCopy } from './ExplainerCopy';

import type { PriceObject } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

const mockMonthlyBilling = () =>
  vi.mocked(useComputePricing).mockReturnValue({
    billing: 'monthly',
    formatPrice: (p: null | PriceObject | undefined) =>
      String(p?.monthly ?? '--.--'),
    getBillingForPlanType: vi.fn(() => 'monthly' as const),
    getPrice: (p: null | PriceObject | undefined) => p?.monthly ?? '--.--',
    getPriceSubheading: vi.fn(),
    hasHourlyEligiblePlans: () => false,
    priceLabel: 'month',
  });

const mockHourlyBilling = () =>
  vi.mocked(useComputePricing).mockReturnValue({
    billing: 'hourly',
    formatPrice: (p: null | PriceObject | undefined) =>
      String(p?.hourly ?? '--.--'),
    getBillingForPlanType: vi.fn(() => 'hourly' as const),
    getPrice: (p: null | PriceObject | undefined) => p?.hourly ?? '--.--',
    getPriceSubheading: vi.fn(),
    hasHourlyEligiblePlans: () => true,
    priceLabel: 'hour',
  });

vi.mock('src/utilities/pricing/useComputePricing', () => ({
  useComputePricing: vi.fn(() => ({
    billing: 'monthly' as const,
    formatPrice: (p: null | PriceObject | undefined) =>
      String(p?.monthly ?? '--.--'),
    getBillingForPlanType: vi.fn(() => 'monthly' as const),
    getPrice: (p: null | PriceObject | undefined) => p?.monthly ?? '--.--',
    getPriceSubheading: vi.fn(),
    hasHourlyEligiblePlans: () => false,
    priceLabel: 'month',
  })),
}));

describe('ExplainerCopy Component', () => {
  const linodeId = 1234;

  beforeEach(() => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: { label: 'Test Linode' },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the correct content for v4Private IPType', () => {
    renderWithTheme(<ExplainerCopy ipType="v4Private" linodeId={linodeId} />);

    expect(
      screen.getByText(/Add a private IP address to your Linode/i)
    ).toBeVisible();
    expect(
      screen.getByText(/Data sent explicitly to and from private IP addresses/i)
    ).toBeVisible();
  });

  it('renders the correct content for v4Public IPType with SupportLink', () => {
    renderWithTheme(<ExplainerCopy ipType="v4Public" linodeId={linodeId} />);

    expect(
      screen.getByText(/Public IP addresses, over and above the one included/i)
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Support Ticket' })).toBeVisible();
  });

  it('displays no content when an unknown IPType is provided', () => {
    renderWithTheme(<ExplainerCopy ipType={null as any} linodeId={linodeId} />);

    expect(screen.queryByText(/Add a private IP address/i)).toBeNull();
    expect(screen.queryByText(/Support Ticket/)).toBeNull();
  });

  it('shows "monthly" charge label for v4Public when billing mode is monthly', () => {
    mockMonthlyBilling();

    renderWithTheme(<ExplainerCopy ipType="v4Public" linodeId={linodeId} />);

    expect(screen.getByText(/monthly/i)).toBeVisible();
    expect(screen.queryByText(/hourly/i)).toBeNull();
  });

  it('shows "hourly" charge label for v4Public when billing mode is hourly', () => {
    mockHourlyBilling();

    renderWithTheme(<ExplainerCopy ipType="v4Public" linodeId={linodeId} />);

    expect(screen.getByText(/hourly/i)).toBeVisible();
    expect(screen.queryByText(/monthly/i)).toBeNull();
  });
});
