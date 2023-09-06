import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetDeleteDialog } from './SubnetDeleteDialog';

const props = {
  onClose: jest.fn(),
  open: true,
  subnetId: 1,
  subnetLabel: 'some subnet',
  vpcId: 1,
};

describe('Delete Subnet drawer', () => {
  it('should render a SubnetDeleteDrawer', () => {
    const { getByText } = renderWithTheme(<SubnetDeleteDialog {...props} />);

    getByText('Delete subnet some subnet');
    getByText('Subnet label');
    getByText('Cancel');
    getByText('Delete');
  });
});
