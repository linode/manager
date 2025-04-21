import * as React from 'react';

import { planSelectionTypeFactory } from 'src/factories/types';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import {
  KubernetesPlanContainer,
  KubernetesPlanContainerProps,
} from './KubernetesPlanContainer';

import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

const plans: PlanWithAvailability[] = planSelectionTypeFactory.buildList(2);

const props: KubernetesPlanContainerProps = {
  allDisabledPlans: [],
  getTypeCount: vi.fn(),
  hasMajorityOfPlansDisabled: false,
  onSelect: vi.fn(),
  plans,
  selectedTier: 'standard',
  selectedRegionId: undefined,
  updatePlanCount: vi.fn(),
  wholePanelIsDisabled: false,
};

beforeAll(() => mockMatchMedia());

describe('KubernetesPlanContainer', () => {
  it('should display a table with column headers', async () => {
    const { findByLabelText, findByText } = renderWithTheme(
      <KubernetesPlanContainer {...props} />
    );

    const table = await findByLabelText('List of Linode Plans');
    expect(table).toBeInTheDocument();

    await findByText('Plan');
    await findByText('Hourly');
    await findByText('Monthly');
    await findByText('RAM');
    await findByText('CPUs');
    await findByText('Storage');
    await findByText('Quantity');
  });

  it('should display no region selection message without a region selection', async () => {
    const { getByText } = renderWithTheme(
      <KubernetesPlanContainer {...props} />
    );

    expect(getByText(PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE)).toBeVisible();
  });
});
