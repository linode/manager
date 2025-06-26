import { regionFactory } from '@linode/utilities';
import * as React from 'react';

import { planSelectionTypeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlansPanel } from './PlansPanel';

import type { PlansPanelProps } from './PlansPanel';

const mockRegionsData = [
  regionFactory.build({
    id: 'us-east',
    label: 'Newark, NJ',
    capabilities: ['Linodes', 'Premium Plans'],
  }),
  regionFactory.build({
    id: 'us-central',
    label: 'Dallas, TX',
    capabilities: ['Linodes', 'Premium Plans'],
  }),
  regionFactory.build({
    id: 'us-southeast',
    label: 'Atlanta, GA',
    capabilities: ['Linodes'],
  }),
];

const mockPremiumPlanId = 'premium-32';

const defaultProps: PlansPanelProps = {
  onSelect: vi.fn(),
  regionsData: mockRegionsData,
  selectedRegionID: 'us-east',
  types: [
    {
      ...planSelectionTypeFactory.build({
        class: 'standard',
      }),
    },
    {
      ...planSelectionTypeFactory.build(),
      class: 'nanode',
    },
    {
      ...planSelectionTypeFactory.build(),
      class: 'dedicated',
    },
    {
      ...planSelectionTypeFactory.build(),
      class: 'gpu',
    },
    {
      ...planSelectionTypeFactory.build(),
      class: 'premium',
      id: mockPremiumPlanId,
    },
  ],
};

const mockRegionAvailabilities = [
  {
    region: 'us-central',
    plan: mockPremiumPlanId,
    available: false,
  },
];

const defaultFlags = { soldOutChips: true };

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useRegionAvailabilityQuery: vi.fn().mockReturnValue({ data: [] }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useRegionAvailabilityQuery: queryMocks.useRegionAvailabilityQuery,
  };
});

describe('plans panel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useRegionAvailabilityQuery.mockReturnValue({
      data: mockRegionAvailabilities,
    });
  });

  it('should render a tabbed panel based on plan selection types types', () => {
    const { getByRole, getByText } = renderWithTheme(
      <PlansPanel {...defaultProps} />
    );

    expect(getByText('Linode Plan')).toBeInTheDocument();
    expect(getByRole('tab', { name: /dedicated cpu/i })).toBeInTheDocument();
    expect(getByRole('tab', { name: /shared cpu/i })).toBeInTheDocument();
    expect(getByRole('tab', { name: /gpu/i })).toBeInTheDocument();
    expect(getByRole('tab', { name: /premium cpu/i })).toBeInTheDocument();
  });

  it('should call onPlanSelectionInvalidated when the selected plan is has limited availability for the region', () => {
    queryMocks.useRegionAvailabilityQuery.mockReturnValue({
      data: mockRegionAvailabilities,
    });
    const onPlanSelectionInvalidated = vi.fn();
    // Render Plans Panel with a premium plan selected for a region that has limited availability for that plan
    const propsWithPremiumPlanSelected = {
      ...defaultProps,
      selectedId: mockPremiumPlanId,
    };
    renderWithTheme(
      <PlansPanel
        {...propsWithPremiumPlanSelected}
        onPlanSelectionInvalidated={onPlanSelectionInvalidated}
        selectedRegionID="us-central"
      />,
      { flags: defaultFlags }
    );

    expect(onPlanSelectionInvalidated).toHaveBeenCalled();
  });

  it('should call onPlanSelectionInvalidated when the panel for that plan is disabled for the region', () => {
    const onPlanSelectionInvalidated = vi.fn();
    // Render Plans Panel with the premium plans panel disabled for the selected region
    const propsWithPremiumPlanSelected = {
      ...defaultProps,
      selectedId: mockPremiumPlanId,
    };
    renderWithTheme(
      <PlansPanel
        {...propsWithPremiumPlanSelected}
        onPlanSelectionInvalidated={onPlanSelectionInvalidated}
        selectedRegionID="us-southeast"
      />,
      { flags: defaultFlags }
    );
    expect(onPlanSelectionInvalidated).toHaveBeenCalled();
  });

  it('should not call onPlanSelectionInvalidated when the selected plan is available for that region', () => {
    queryMocks.useRegionAvailabilityQuery.mockReturnValue({
      data: mockRegionAvailabilities,
    });
    const onPlanSelectionInvalidated = vi.fn();
    // Render Plans Panel with a premium plan selected for a region that has that plan available
    const propsWithPremiumPlanSelected = {
      ...defaultProps,
      selectedId: mockPremiumPlanId,
    };
    renderWithTheme(
      <PlansPanel
        {...propsWithPremiumPlanSelected}
        onPlanSelectionInvalidated={onPlanSelectionInvalidated}
        selectedRegionID="us-east"
      />,
      { flags: defaultFlags }
    );
    expect(onPlanSelectionInvalidated).not.toHaveBeenCalled();
  });
});
