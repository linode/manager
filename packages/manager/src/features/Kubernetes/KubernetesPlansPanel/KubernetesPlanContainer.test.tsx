import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { PLAN_NO_REGION_SELECTED_MESSAGE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  KubernetesPlanContainer,
  KubernetesPlanContainerProps,
} from './KubernetesPlanContainer';

// const types = linodeTypeFactory.build({
//   price: {
//     hourly: 0.1,
//     monthly: 5,
//   },
//   region_prices: [],
// });

const props: KubernetesPlanContainerProps = {
  disabled: false,
  getTypeCount: jest.fn(),
  onAdd: jest.fn(),
  onSelect: jest.fn(),
  plans: extendedTypes,
  selectedID: '1234',
  selectedRegionID: 'us-east',
  updatePlanCount: jest.fn(),
};

describe('KubernetesPlanContainer', () => {
  it.skip('with the DC-specific pricing feature flag off, it should display plans and pricing without a region', async () => {
    const { findByLabelText, findByText } = renderWithTheme(
      <KubernetesPlanContainer {...props} />
    );

    const table = await findByLabelText('List of Linode Plans');
    expect(table).toBeInTheDocument();

    await findByText('Monthly');
    await findByText('Hourly');
    expect(
      await findByText(PLAN_NO_REGION_SELECTED_MESSAGE)
    ).not.toBeInTheDocument();
  });

  it.skip('with the DC-specific pricing feature flag on, it should not display plans and pricing without a region selected', async () => {
    const { findByText } = renderWithTheme(
      <KubernetesPlanContainer {...props} selectedRegionID={undefined} />,
      { flags: { dcSpecificPricing: true } }
    );

    await findByText(PLAN_NO_REGION_SELECTED_MESSAGE);
    expect(await findByText('/$/')).not.toBeInTheDocument();
  });
});
