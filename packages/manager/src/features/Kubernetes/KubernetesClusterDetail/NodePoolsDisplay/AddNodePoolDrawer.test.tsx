import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { AddNodePoolDrawer, Props } from './AddNodePoolDrawer';

const props: Props = {
  clusterId: 0,
  clusterLabel: 'test',
  open: true,
  onClose: jest.fn(),
};

describe('AddNodePoolDrawer', () => {
  it('should render plan heading', async () => {
    const { findByText } = renderWithTheme(<AddNodePoolDrawer {...props} />);

    await findByText('Dedicated CPU');
  });
});
