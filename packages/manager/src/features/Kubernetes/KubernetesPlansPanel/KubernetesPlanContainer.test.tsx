import * as React from 'react';

import { extendedTypeFactory } from 'src/factories/types';
import { PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import {
  KubernetesPlanContainer,
  KubernetesPlanContainerProps,
} from './KubernetesPlanContainer';

const plans = extendedTypeFactory.buildList(2);

const props: KubernetesPlanContainerProps = {
  getTypeCount: jest.fn(),
  onSelect: jest.fn(),
  plans,
  selectedRegionID: undefined,
  updatePlanCount: jest.fn(),
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

  it('should display no region selection message without a region selection when the DC-specific pricing feature flag is on ', async () => {
    const { getByText } = renderWithTheme(
      <KubernetesPlanContainer {...props} />,
      { flags: { dcSpecificPricing: true } }
    );

    expect(getByText(PLAN_SELECTION_NO_REGION_SELECTED_MESSAGE)).toBeVisible();
  });
});
