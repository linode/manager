import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddNodePoolDrawer } from './AddNodePoolDrawer';

import type { Props } from './AddNodePoolDrawer';

const props: Props = {
  clusterId: 0,
  clusterLabel: 'test',
  clusterRegionId: 'us-east',
  clusterTier: 'standard',
  onClose: vi.fn(),
  open: true,
  regionsData: [],
};

describe('AddNodePoolDrawer', () => {
  it('should render plan heading', async () => {
    const { findByText } = renderWithTheme(<AddNodePoolDrawer {...props} />);

    await findByText('Dedicated CPU');
  });

  it('should display the GPU tab for standard clusters', async () => {
    const { findByText } = renderWithTheme(<AddNodePoolDrawer {...props} />);

    expect(await findByText('GPU')).toBeInTheDocument();
  });

  it('should not display the GPU tab for enterprise clusters', async () => {
    const { queryByText } = renderWithTheme(
      <AddNodePoolDrawer {...props} clusterTier="enterprise" />
    );

    await expect(queryByText('GPU')).toBeNull();
  });
});
