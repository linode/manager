import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { extendedTypes } from 'src/__data__';
import type { NodePoolPanelProps } from './NodePoolPanel';
import { NodePoolPanel } from './NodePoolPanel';

const props: NodePoolPanelProps = {
  hasSelectedRegion: true,
  isSelectedRegionEligibleForPlan: () => false,
  isPlanPanelDisabled: () => false,
  regionsData: [],
  types: extendedTypes,
  typesLoading: false,
  addNodePool: jest.fn(),
};

describe('NodePoolPanel', () => {
  it('should render plan heading', async () => {
    const { findByText } = renderWithTheme(<NodePoolPanel {...props} />);

    await findByText('Dedicated CPU');
  });
});
