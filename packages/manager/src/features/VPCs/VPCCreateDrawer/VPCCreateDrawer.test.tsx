import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VPCCreateDrawer } from './VPCCreateDrawer';

const props = {
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  open: true,
};

const formOptions = {
  defaultValues: {
    description: '',
    label: '',
    region: '',
    subnets: [
      {
        ipv4: '',
        label: 'subnet 0',
      },
    ],
  },
};

describe('VPC Create Drawer', () => {
  it('should render the vpc and subnet sections', () => {
    const { getAllByText } = renderWithThemeAndHookFormContext({
      component: <VPCCreateDrawer {...props} />,
      useFormOptions: formOptions,
    });

    getAllByText('VPC Label');
    getAllByText('Region');
    getAllByText('Description');
    getAllByText('Subnets');
    getAllByText('Subnet Label');
    getAllByText('Subnet IP Address Range');
    getAllByText('Add another Subnet');
    getAllByText('Cancel');
    getAllByText('Create VPC');
  });

  it('should not be able to remove the first subnet', () => {
    const { queryByTestId } = renderWithThemeAndHookFormContext({
      component: <VPCCreateDrawer {...props} />,
      useFormOptions: formOptions,
    });

    expect(queryByTestId('delete-subnet-0')).toBeNull();
  });

  it('should close the drawer', async () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <VPCCreateDrawer {...props} />,
      useFormOptions: formOptions,
    });
    const cancelButton = getByText('Cancel');
    await userEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
