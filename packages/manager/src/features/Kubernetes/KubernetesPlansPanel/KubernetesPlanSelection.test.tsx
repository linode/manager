import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { wrapWithTableBody } from 'src/utilities/testHelpers';

import {
  KubernetesPlanSelection,
  KubernetesPlanSelectionProps,
} from './KubernetesPlanSelection';

const props: KubernetesPlanSelectionProps = {
  disabled: false,
  getTypeCount: jest.fn(),
  idx: 0,
  onAdd: jest.fn(),
  onSelect: jest.fn(),
  selectedID: '1234',
  selectedRegionID: 'us-east',
  type: extendedTypes[0],
  updatePlanCount: jest.fn(),
};

describe('KubernetesPlanSelection', () => {
  it('Includes the plan label, monthly, and hourly price', async () => {
    const { queryAllByText } = render(
      wrapWithTableBody(<KubernetesPlanSelection {...props} />)
    );

    await waitFor(() => expect(queryAllByText('Linode 1 GB')));
    await waitFor(() => expect(queryAllByText('$10')));
    await waitFor(() => expect(queryAllByText('$0.015')));
  });

  it('Includes a DC-specific monthly and hourly price in a region with a price increase when the DC-Specific pricing feature flag on', async () => {
    const { queryAllByText } = render(
      wrapWithTableBody(
        <KubernetesPlanSelection {...props} selectedRegionID="id-cgk" />,
        { flags: { dcSpecificPricing: true } }
      )
    );

    await waitFor(() => expect(queryAllByText('Linode 1 GB')));
    await waitFor(() => expect(queryAllByText('$12')));
    await waitFor(() => expect(queryAllByText('$0.018')));
  });

  it('Uses the base monthly and hourly price in a region with a price increase when the DC-Specific pricing feature flag off', async () => {
    const { queryAllByText } = render(
      wrapWithTableBody(
        <KubernetesPlanSelection {...props} selectedRegionID="id-cgk" />
      )
    );

    await waitFor(() => expect(queryAllByText('$10')));
    await waitFor(() => expect(queryAllByText('$0.015')));
  });
});
