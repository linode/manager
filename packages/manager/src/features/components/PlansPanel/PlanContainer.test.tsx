import React from 'react';

import { planSelectionTypeFactory } from 'src/factories/types';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { mockMatchMedia } from 'src/utilities/testHelpers';

import { PLAN_FILTER_NO_RESULTS_MESSAGE } from './constants';
import { PlanContainer, type PlanFilterRenderArgs } from './PlanContainer';

import type { PlanWithAvailability } from './types';

const queryMocks = vi.hoisted(() => ({
  useIsGenerationalPlansEnabled: vi.fn(() => ({
    isGenerationalPlansEnabled: true,
  })),
}));

vi.mock('src/utilities/linodes', () => ({
  useIsGenerationalPlansEnabled: queryMocks.useIsGenerationalPlansEnabled,
}));

const mockPlans: PlanWithAvailability[] = planSelectionTypeFactory.buildList(2);

beforeAll(() => mockMatchMedia());

describe('PlanContainer', () => {
  it('shows the no region selected message when no region is selected', () => {
    const { getByText } = renderWithTheme(
      <PlanContainer
        allDisabledPlans={[]}
        hasMajorityOfPlansDisabled={false}
        onSelect={() => {}}
        plans={mockPlans}
        selectedRegionId={undefined}
      />
    );

    expect(getByText(PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE)).toBeVisible();
  });

  it('shows the no plans found message when filters return empty results', async () => {
    let hasSentResult = false;

    const planFilters = ({ onResult }: PlanFilterRenderArgs) => {
      if (!hasSentResult) {
        hasSentResult = true;
        onResult({
          filteredPlans: [],
          filterUI: <div>Filter UI</div>,
          hasActiveFilters: true,
        });
      }

      return null;
    };

    const { findByText } = renderWithTheme(
      <PlanContainer
        allDisabledPlans={[]}
        hasMajorityOfPlansDisabled={false}
        onSelect={() => {}}
        planFilters={planFilters}
        plans={mockPlans}
        selectedRegionId="us-east"
      />
    );

    expect(await findByText(PLAN_FILTER_NO_RESULTS_MESSAGE)).toBeVisible();
  });
});
