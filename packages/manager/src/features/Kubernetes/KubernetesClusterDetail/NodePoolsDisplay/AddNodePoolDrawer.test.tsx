import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddNodePoolDrawer, Props } from './AddNodePoolDrawer';

const props: Props = {
  clusterId: 0,
  clusterLabel: 'test',
  clusterRegionId: 'us-east',
  onClose: vi.fn(),
  open: true,
  regionsData: [],
};

describe('AddNodePoolDrawer', () => {
  it('should render plan heading', async () => {
    const { findByText } = renderWithTheme(<AddNodePoolDrawer {...props} />);

    await findByText('Dedicated CPU');
  });
});
