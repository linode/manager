import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import {
  extendedTypeFactory,
  planSelectionTypeFactory,
} from 'src/factories/types';
import { LIMITED_AVAILABILITY_TEXT } from 'src/features/components/PlansPanel/constants';
import { breakpoints } from 'src/foundations/breakpoints';
import { resizeScreenSize } from 'src/utilities/testHelpers';
import { wrapWithTableBody } from 'src/utilities/testHelpers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlanSelection } from './PlanSelection';

import type { PlanSelectionProps } from './PlanSelection';
import type { PlanSelectionType } from './types';

const mockPlan: PlanSelectionType = planSelectionTypeFactory.build({
  heading: 'Dedicated 20 GB',
  subHeadings: [
    '$10/mo ($0.015/hr)',
    '1 CPU, 50 GB Storage, 2 GB RAM',
    '2 TB Transfer',
    '40 Gbps In / 2 Gbps Out',
  ],
});

const defaultProps: PlanSelectionProps = {
  idx: 0,
  isLimitedAvailabilityPlan: false,
  onSelect: () => vi.fn(),
  type: mockPlan,
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
    expect(queryByLabelText(LIMITED_AVAILABILITY_TEXT)).toBeNull();
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

  it('should not display an error message for $0 regions', () => {
    const propsWithRegionZeroPrice = {
      ...defaultProps,
      type: planSelectionTypeFactory.build({
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
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection
          {...defaultProps}
          isLimitedAvailabilityPlan={true}
          type={bigPlanType}
        />,
        { flags: { disableLargestGbPlans: true } }
      )
    );

    const button = getByTestId('limited-availability');
    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(getByText(LIMITED_AVAILABILITY_TEXT)).toBeVisible();
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

  it('shows the dynamic prices for a region with DC-specific pricing', () => {
    const { container } = renderWithTheme(
      <PlanSelection {...defaultProps} selectedRegionId={'br-gru'} />
    );

    expect(
      container.querySelector('[data-qa-selection-card]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-qa-select-card-heading]')
    ).toHaveTextContent(mockPlan.heading);
    expect(
      container.querySelector('[data-qa-select-card-subheading="subheading-1"]')
    ).toHaveTextContent('$14.40/mo ($0.021/hr)');
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

  it('verifies the presence of a help icon button accompanied by descriptive text for plans marked as "Limited Availability".', async () => {
    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <PlanSelection
        {...defaultProps}
        isLimitedAvailabilityPlan={true}
        selectedRegionId={'us-east'}
      />
    );

    const selectionCard = getByTestId('selection-card');
    fireEvent.mouseOver(selectionCard);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(getByText(LIMITED_AVAILABILITY_TEXT)).toBeVisible();
  });

  it('is disabled for 512 GB plans', () => {
    const bigPlanType = extendedTypeFactory.build({
      heading: 'Dedicated 512 GB',
      label: 'Dedicated 512GB',
    });

    const { getByTestId } = renderWithTheme(
      <PlanSelection
        {...defaultProps}
        isLimitedAvailabilityPlan={false}
        type={bigPlanType}
      />,
      { flags: { disableLargestGbPlans: true } }
    );

    const selectionCard = getByTestId('selection-card');
    expect(selectionCard).toBeDisabled();
  });
});
