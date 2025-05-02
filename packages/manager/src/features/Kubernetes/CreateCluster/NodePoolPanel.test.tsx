import * as React from 'react';

import { extendedTypes } from 'src/__data__';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodePoolPanel } from './NodePoolPanel';

import type { NodePoolPanelProps } from './NodePoolPanel';

const props: NodePoolPanelProps = {
  addNodePool: vi.fn(),
  hasSelectedRegion: true,
  isPlanPanelDisabled: () => false,
  isSelectedRegionEligibleForPlan: () => false,
  regionsData: [],
  selectedRegionId: 'us-east',
  selectedTier: 'standard',
  types: extendedTypes,
  typesLoading: false,
};

describe('NodePoolPanel', () => {
  it('should render plan heading', async () => {
    const { findByText } = renderWithTheme(<NodePoolPanel {...props} />);

    await findByText('Dedicated CPU');
  });
});
