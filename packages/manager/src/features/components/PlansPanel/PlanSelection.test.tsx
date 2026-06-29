import { getLinodeRegionPrice } from '@akamai/compute-ui-core/api';
import { breakpoints } from '@linode/ui';
import { fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';

import {
  extendedTypeFactory,
  planSelectionTypeFactory,
} from 'src/factories/types';
import { LIMITED_AVAILABILITY_COPY } from 'src/features/components/PlansPanel/constants';
import { formatPrice as realFormatPrice } from 'src/utilities/pricing/priceInterval';
import { useComputePricing } from 'src/utilities/pricing/useComputePricing';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { resizeScreenSize } from 'src/utilities/testHelpers';
import { wrapWithTableBody } from 'src/utilities/testHelpers';

import { PlanSelection } from './PlanSelection';

import type { PlanSelectionProps } from './PlanSelection';
import type { PlanWithAvailability } from './types';
import type { PriceObject } from '@linode/api-v4';

vi.mock('@akamai/compute-ui-core/api', async () => {
  const actual = await vi.importActual<
    typeof import('@akamai/compute-ui-core/api')
  >('@akamai/compute-ui-core/api');
  return {
    ...actual,
    getLinodeRegionPrice: vi.fn(actual.getLinodeRegionPrice),
  };
});

vi.mock('src/utilities/pricing/useComputePricing', () => ({
  useComputePricing: vi.fn(() => ({
    billing: 'monthly' as const,
    formatPrice: vi.fn(),
    getBillingForPlanType: vi.fn(),
    getPrice: vi.fn(),
    getPriceSubheading: (p: null | PriceObject | undefined) =>
      `$${realFormatPrice(p?.monthly)}/mo ($${realFormatPrice(p?.hourly)}/hr)`,
    hasHourlyEligiblePlans: () => false,
    priceLabel: 'month',
  })),
}));

const mockMonthlyBilling = () =>
  vi.mocked(useComputePricing).mockReturnValue({
    billing: 'monthly',
    formatPrice: vi.fn(),
    getBillingForPlanType: vi.fn(),
    getPrice: vi.fn(),
    getPriceSubheading: (p: null | PriceObject | undefined) =>
      `$${realFormatPrice(p?.monthly)}/mo ($${realFormatPrice(p?.hourly)}/hr)`,
    hasHourlyEligiblePlans: () => false,
    priceLabel: 'month',
  });

const mockHourlyBilling = () =>
  vi.mocked(useComputePricing).mockReturnValue({
    billing: 'hourly',
    formatPrice: vi.fn(),
    getBillingForPlanType: vi.fn(),
    getPrice: vi.fn(),
    getPriceSubheading: (p: null | PriceObject | undefined) =>
      `$${realFormatPrice(p?.hourly)}/hr`,
    hasHourlyEligiblePlans: () => true,
    priceLabel: 'hour',
  });

const mockPlan: PlanWithAvailability = planSelectionTypeFactory.build({
  heading: 'Dedicated 20 GB',
  subHeadings: [
    '$10/mo ($0.015/hr)',
    '1 CPU, 50 GB Storage, 2 GB RAM',
    '2 TB Transfer',
    '40 Gbps In / 2 Gbps Out',
  ],
});

const defaultProps: PlanSelectionProps = {
  hasMajorityOfPlansDisabled: false,
  idx: 0,
  onSelect: () => vi.fn(),
  plan: mockPlan,
};

describe('PlanSelection (table, desktop)', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.lg);
  });

  it('renders the table row', () => {
    const { container, queryByLabelText } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection
          {...defaultProps}
          isCreate={true}
          selectedRegionId={'us-east'}
        />
      )
    );

    expect(container.querySelector('[data-qa-plan-row]')).toBeInTheDocument();
    expect(container.querySelector('[data-qa-plan-name]')).toHaveTextContent(
      mockPlan.heading
    );
    expect(container.querySelector('[data-qa-monthly]')).toHaveTextContent(
      '$10'
    );
    expect(container.querySelector('[data-qa-hourly]')).toHaveTextContent(
      '$0.015'
    );
    expect(container.querySelector('[data-qa-ram]')).toHaveTextContent('16 GB');
    expect(container.querySelector('[data-qa-cpu]')).toHaveTextContent('8');
    expect(container.querySelector('[data-qa-storage]')).toHaveTextContent(
      '1024 GB'
    );
    expect(queryByLabelText(LIMITED_AVAILABILITY_COPY)).toBeNull();
  });

  it('renders the table row with unknown prices if a region is not selected', () => {
    const { container } = renderWithTheme(
      wrapWithTableBody(<PlanSelection {...defaultProps} isCreate={true} />)
    );

    expect(container.querySelector('[data-qa-plan-row]')).toBeInTheDocument();
    expect(container.querySelector('[data-qa-plan-name]')).toHaveTextContent(
      mockPlan.heading
    );
    expect(container.querySelector('[data-qa-monthly]')).toHaveTextContent(
      '$--.--'
    );
    expect(container.querySelector('[data-qa-hourly]')).toHaveTextContent(
      '$--.--'
    );
  });

  it('selects the plan when clicked', () => {
    const mockOnSelect = vi.fn();

    const { getByRole } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection {...defaultProps} onSelect={mockOnSelect} />
      )
    );

    const radioInput = getByRole('radio');
    fireEvent.click(radioInput);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('shows the dynamic prices for a region with DC-specific pricing', () => {
    const { container } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection {...defaultProps} selectedRegionId={'br-gru'} />
      )
    );

    expect(container.querySelector('[data-qa-plan-row]')).toBeInTheDocument();
    expect(container.querySelector('[data-qa-plan-name]')).toHaveTextContent(
      mockPlan.heading
    );
    expect(container.querySelector('[data-qa-monthly]')).toHaveTextContent(
      '$14'
    );
    expect(container.querySelector('[data-qa-hourly]')).toHaveTextContent(
      '$0.021'
    );
    expect(container.querySelector('[data-qa-ram]')).toHaveTextContent('16 GB');
    expect(container.querySelector('[data-qa-cpu]')).toHaveTextContent('8');
    expect(container.querySelector('[data-qa-storage]')).toHaveTextContent(
      '1024 GB'
    );
  });

  it('shows the same network_in and network_out values for distributed regions', () => {
    const { container } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection
          {...defaultProps}
          plan={{
            ...mockPlan,
            class: 'dedicated',
            id: 'g6-dedicated-edge-2',

            network_out: 4000,
          }}
          selectedRegionId={'us-den-1'}
          showNetwork
        />
      )
    );
    expect(container.querySelector('[data-qa-network]')).toHaveTextContent(
      '4 Gbps / 4 Gbps'
    );
  });

  it('should not display an error message for $0 regions', () => {
    const propsWithRegionZeroPrice = {
      ...defaultProps,
      plan: planSelectionTypeFactory.build({
        heading: 'Dedicated 20 GB',
        region_prices: [
          {
            hourly: 0,
            id: 'br-gru',
            monthly: 0,
          },
        ],
        subHeadings: [
          '$10/mo ($0.015/hr)',
          '1 CPU, 50 GB Storage, 2 GB RAM',
          '2 TB Transfer',
          '40 Gbps In / 2 Gbps Out',
        ],
      }),
    };
    const { container } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection
          {...propsWithRegionZeroPrice}
          selectedRegionId={'br-gru'}
        />
      )
    );

    const monthlyTableCell = container.querySelector('[data-qa-monthly]');
    const hourlyTableCell = container.querySelector('[data-qa-hourly]');
    expect(monthlyTableCell).toHaveTextContent('$0');
    // error tooltip button should not display
    expect(
      monthlyTableCell?.querySelector('[data-qa-help-button]')
    ).not.toBeInTheDocument();
    expect(hourlyTableCell).toHaveTextContent('$0');
    expect(
      hourlyTableCell?.querySelector('[data-qa-help-button]')
    ).not.toBeInTheDocument();
  });

  it('shows limited availability messaging for 512 GB plans', async () => {
    const bigPlanType = extendedTypeFactory.build({
      heading: 'Dedicated 512 GB',
      label: 'Dedicated 512GB',
      planHasLimitedAvailability: true,
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      wrapWithTableBody(<PlanSelection {...defaultProps} plan={bigPlanType} />)
    );

    const button = getByTestId('tooltip-info-icon');
    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(getByText(LIMITED_AVAILABILITY_COPY)).toBeVisible();
  });

  describe('billing mode - switching via computePricing LD flag (table, desktop)', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('calls useComputePricing in PlanSelection with the plan id', () => {
      renderWithTheme(
        wrapWithTableBody(<PlanSelection {...defaultProps} isCreate={true} />)
      );
      expect(useComputePricing).toHaveBeenCalledWith(mockPlan.id);
    });

    it('shows monthly and hourly prices in monthly billing mode (default)', () => {
      mockMonthlyBilling();

      const { getAllByRole } = renderWithTheme(
        wrapWithTableBody(
          <PlanSelection
            {...defaultProps}
            isCreate={true}
            selectedRegionId={'us-east'}
          />
        )
      );

      const [monthlyCell, hourlyCell] = getAllByRole('cell').slice(2);
      expect(monthlyCell).toHaveTextContent('$10');
      expect(hourlyCell).toHaveTextContent('$0.015');
    });

    it('always shows "N/A" in the monthly cell in hourly billing mode regardless of what the API returns', () => {
      // Hourly-scoped plans are billed purely by the hour — monthly pricing does not apply.
      // The monthly cell must show "N/A" in both cases:
      //   1. The API returns a monthly price (e.g. $10) — unlikely for hourly-scoped plans, but we still show N/A as a defensive safeguard.
      //   2. The API returns null for monthly - also N/A, same outcome.

      // Case 1: API returns a monthly price - should still be N/A.
      mockHourlyBilling();

      const { getAllByRole, rerender } = renderWithTheme(
        wrapWithTableBody(
          <PlanSelection
            {...defaultProps}
            isCreate={true}
            selectedRegionId={'us-east'}
          />
        )
      );

      let [monthlyCell, hourlyCell] = getAllByRole('cell').slice(2);
      expect(monthlyCell).toHaveTextContent('N/A');
      expect(hourlyCell).toHaveTextContent('$0.015');

      // Case 2: API returns null for monthly - should also be N/A.
      mockHourlyBilling();
      vi.mocked(getLinodeRegionPrice).mockReturnValueOnce({
        hourly: 0.015,
        monthly: null,
      });

      rerender(
        wrapWithTableBody(
          <PlanSelection
            {...defaultProps}
            isCreate={true}
            selectedRegionId={'us-east'}
          />
        )
      );

      [monthlyCell, hourlyCell] = getAllByRole('cell').slice(2);
      expect(monthlyCell).toHaveTextContent('N/A');
      expect(hourlyCell).toHaveTextContent('$0.015');
    });

    it('shows $--.-- with an error tooltip in the monthly cell in monthly billing when API monthly price is unexpectedly absent', () => {
      // This error state occurs in two scenarios:
      // 1. LD billing is set to 'monthly' for all plans OR
      // 2. LD billing is 'hourly' + activeBillingPlanMatchers has entries, but the given plan does not match -> it falls back to monthly billing.
      // In both cases the plan is in monthly billing mode, where a null monthly price from the API is unexpected
      // and should be treated as an error (unlike hourly billing, where null monthly is intentional and shown as N/A).
      mockMonthlyBilling();
      vi.mocked(getLinodeRegionPrice).mockReturnValueOnce({
        hourly: 0.015,
        monthly: null,
      });

      const { getAllByRole } = renderWithTheme(
        wrapWithTableBody(
          <PlanSelection
            {...defaultProps}
            isCreate={true}
            selectedRegionId={'us-east'}
          />
        )
      );

      const [monthlyCell, hourlyCell] = getAllByRole('cell').slice(2);
      expect(monthlyCell).toHaveTextContent('$--.--');
      // Monthly price unexpectedly absent in monthly billing — error tooltip must appear
      const errorTooltip = within(monthlyCell).getByRole('button');
      expect(errorTooltip).toBeVisible();
      expect(hourlyCell).toHaveTextContent('$0.015');
    });

    it('shows $--.-- with an error tooltip in the hourly cell regardless of billing mode when hourly price is unavailable for the selected region', () => {
      // The hourly cell error condition is independent of billing mode - it executes whenever
      // hourly price is null regardless of whether billing is 'monthly' or 'hourly'.
      mockMonthlyBilling();
      vi.mocked(getLinodeRegionPrice).mockReturnValueOnce({
        hourly: null,
        monthly: null,
      });

      const { getAllByRole } = renderWithTheme(
        wrapWithTableBody(
          <PlanSelection
            {...defaultProps}
            isCreate={true}
            selectedRegionId={'us-east'}
          />
        )
      );

      const [hourlyCell] = getAllByRole('cell').slice(3);
      expect(hourlyCell).toHaveTextContent('$--.--');
      // Hourly price unexpectedly absent — error tooltip must appear
      const errorTooltip = within(hourlyCell).getByRole('button');
      expect(errorTooltip).toBeVisible();
    });
  });
});

describe('PlanSelection (card, mobile)', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.sm);
  });

  it('renders the table row', () => {
    const { container } = renderWithTheme(
      <PlanSelection {...defaultProps} selectedRegionId={'us-east'} />
    );

    expect(
      container.querySelector('[data-qa-selection-card]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-qa-select-card-heading]')
    ).toHaveTextContent(mockPlan.heading);
    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-1"]')
    ).toHaveTextContent('$10/mo ($0.015/hr)');
    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-2"]')
    ).toHaveTextContent('1 CPU, 50 GB Storage, 2 GB RAM');
    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-3"]')
    ).toHaveTextContent('2 TB Transfer');
    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-4"]')
    ).toHaveTextContent('40 Gbps In / 2 Gbps Out');
  });

  it('renders the table row with unknown prices if a region is not selected', () => {
    const { container } = renderWithTheme(<PlanSelection {...defaultProps} />);

    expect(
      container.querySelector('[data-qa-selection-card]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-qa-select-card-heading]')
    ).toHaveTextContent(mockPlan.heading);
    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-1"]')
    ).toHaveTextContent('$--.--/mo ($--.--/hr)');
  });

  it('selects the plan when clicked', () => {
    const mockOnSelect = vi.fn();

    const { container } = renderWithTheme(
      <PlanSelection {...defaultProps} onSelect={mockOnSelect} />
    );

    fireEvent.click(container.querySelector('[data-qa-selection-card]')!);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('shows the dynamic prices for a region with DC-specific pricing', async () => {
    const { container } = renderWithTheme(
      <PlanSelection {...defaultProps} selectedRegionId={'br-gru'} />
    );

    expect(
      container.querySelector('[data-qa-selection-card]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-qa-select-card-heading]')
    ).toHaveTextContent(mockPlan.heading);

    // Wait for price mutation to complete before asserting
    await waitFor(() => {
      expect(
        container.querySelector(
          '[data-qa-select-card-subheading="subheading-1"]'
        )
      ).toHaveTextContent('$14.40/mo ($0.021/hr)');
    });

    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-2"]')
    ).toHaveTextContent('1 CPU, 50 GB Storage, 2 GB RAM');
    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-3"]')
    ).toHaveTextContent('2 TB Transfer');
    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-4"]')
    ).toHaveTextContent('40 Gbps In / 2 Gbps Out');
  });

  describe('billing mode - switching via computePricing LD flag (card, mobile)', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('subheading displays "$monthly/mo ($hourly/hr)" in monthly billing mode', () => {
      mockMonthlyBilling();

      const { getByText } = renderWithTheme(
        <PlanSelection {...defaultProps} selectedRegionId={'us-east'} />
      );

      expect(getByText('$10/mo ($0.015/hr)')).toBeVisible();
    });

    it('subheading shows only "$hourly/hr" in hourly billing mode, even when monthly price is present', () => {
      mockHourlyBilling();

      const { getByText, queryByText } = renderWithTheme(
        <PlanSelection {...defaultProps} selectedRegionId={'us-east'} />
      );

      expect(getByText('$0.015/hr')).toBeVisible();
      expect(queryByText(/\/mo/)).not.toBeInTheDocument();
    });

    it('subheading shows only "$hourly/hr" in hourly billing mode when monthly price is absent', () => {
      mockHourlyBilling();
      vi.mocked(getLinodeRegionPrice).mockReturnValueOnce({
        hourly: 0.015,
        monthly: null,
      });

      const { getByText, queryByText } = renderWithTheme(
        <PlanSelection {...defaultProps} selectedRegionId={'us-east'} />
      );

      expect(getByText('$0.015/hr')).toBeVisible();
      expect(queryByText(/\/mo/)).not.toBeInTheDocument();
    });
  });
});
