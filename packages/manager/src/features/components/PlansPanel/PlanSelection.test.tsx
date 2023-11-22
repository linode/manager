import { fireEvent } from '@testing-library/react';
import React from 'react';

import { planSelectionTypeFactory } from 'src/factories/types';
import { breakpoints } from 'src/foundations/breakpoints';
import { resizeScreenSize } from 'src/utilities/testHelpers';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { wrapWithTableBody } from 'src/utilities/testHelpers';

import { PlanSelection } from './PlanSelection';

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

describe('PlanSelection (table, desktop)', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.lg);
  });

  it('renders the table row', () => {
    const { container } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection
          idx={0}
          isCreate={true}
          onSelect={() => vi.fn()}
          selectedRegionId={'us-east'}
          type={mockPlan}
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
  });

  it('renders the table row with unknown prices if a region is not selected', () => {
    const { container } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection
          idx={0}
          isCreate={true}
          onSelect={() => vi.fn()}
          type={mockPlan}
        />
      )
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
        <PlanSelection idx={0} onSelect={mockOnSelect} type={mockPlan} />
      )
    );

    const radioInput = getByRole('radio');
    fireEvent.click(radioInput);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('shows the dynamic prices for a region with DC-specific pricing', () => {
    const { container } = renderWithTheme(
      wrapWithTableBody(
        <PlanSelection
          idx={0}
          onSelect={() => {}}
          selectedRegionId={'br-gru'}
          type={mockPlan}
        />
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
});

describe('PlanSelection (card, mobile)', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.sm);
  });

  it('renders the table row', () => {
    const { container } = renderWithTheme(
      <PlanSelection
        idx={0}
        onSelect={() => {}}
        selectedRegionId={'us-east'}
        type={mockPlan}
      />
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
    const { container } = renderWithTheme(
      <PlanSelection idx={0} onSelect={() => {}} type={mockPlan} />
    );

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
      <PlanSelection idx={0} onSelect={mockOnSelect} type={mockPlan} />
    );

    fireEvent.click(container.querySelector('[data-qa-selection-card]')!);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('shows the dynamic prices for a region with DC-specific pricing', () => {
    const { container } = renderWithTheme(
      <PlanSelection
        idx={0}
        onSelect={() => {}}
        selectedRegionId={'br-gru'}
        type={mockPlan}
      />
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
});
