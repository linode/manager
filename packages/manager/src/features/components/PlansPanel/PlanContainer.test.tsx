import React from 'react';

import { planSelectionTypeFactory } from 'src/factories/types';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { mockMatchMedia } from 'src/utilities/testHelpers';

import { PlanContainer } from './PlanContainer';

import type { PlanSelectionType } from './types';

const mockPlans: PlanSelectionType[] = planSelectionTypeFactory.buildList(2);

beforeAll(() => mockMatchMedia());

// Mock the useFlags hook
vi.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    dcSpecificPricing: true,
  }),
}));

describe('PlanContainer', () => {
  it('shows the no region selected message when no region is selected with the dcSpecificPricing off', () => {
    const { getByText } = renderWithTheme(
      <PlanContainer
        onSelect={() => {}}
        plans={mockPlans}
        selectedRegionId={undefined}
      />
    );

    expect(getByText(PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE)).toBeVisible();
  });
});
