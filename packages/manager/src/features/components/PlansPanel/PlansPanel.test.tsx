import * as React from 'react';

import { planSelectionTypeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlansPanel } from './PlansPanel';

import type { PlansPanelProps } from './PlansPanel';

const defaultProps: PlansPanelProps = {
  onSelect: vi.fn(),
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
    },
  ],
};

describe('plans panel', () => {
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
});
