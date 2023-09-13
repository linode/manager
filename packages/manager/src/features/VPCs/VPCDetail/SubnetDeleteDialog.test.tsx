import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetDeleteDialog } from './SubnetDeleteDialog';

const props = {
  onClose: jest.fn(),
  open: true,
  subnet: subnetFactory.build({ label: 'some subnet' }),
  vpcId: 1,
};

describe('Delete Subnet dialog', () => {
  it('should render a SubnetDeleteDialog', () => {
    const { getByText } = renderWithTheme(<SubnetDeleteDialog {...props} />);

    getByText('Delete Subnet some subnet');
    getByText('Subnet label');
    getByText('Cancel');
    getByText('Delete');
  });
});
