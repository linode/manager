import * as React from 'react';

import { vpcFactory } from 'src/factories/vpcs';
import { renderWithTheme } from 'src/utilities/testHelpers';

import * as VPCUtils from '../utils';
import { VPCEditDrawer } from './VPCEditDrawer';

const queryMocks = vi.hoisted(() => ({
  useVPCsQuery: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      update_vpc: true,
    },
  })),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
describe('Edit VPC Drawer', () => {
  const props = {
    isFetching: false,
    onClose: vi.fn(),
    open: true,
    vpc: vpcFactory.build(),
    vpcError: null,
  };

  it('Should render a title, label input, description input, and action buttons', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <VPCEditDrawer {...props} />
    );
    const drawerTitle = getByText('Edit VPC');
    expect(drawerTitle).toBeVisible();

    const label = getByText('Label');
    const labelInput = getByTestId('label');
    expect(label).toBeVisible();
    expect(labelInput).toBeEnabled();

    const description = getByText('Description');
    const descriptionInput = getByTestId('description');
    expect(description).toBeVisible();
    expect(descriptionInput).toBeEnabled();

    const saveButton = getByTestId('save-button');
    expect(saveButton).toBeVisible();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();
  });

  it('Should disable the Label and Description inputs when user does not have "update_vpc" permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: false,
      },
    });
    const { getByLabelText } = renderWithTheme(<VPCEditDrawer {...props} />);

    const labelInput = getByLabelText('Label');
    expect(labelInput).toHaveAttribute('disabled');

    const descriptionInput = getByLabelText('Description');
    expect(descriptionInput).toHaveAttribute('disabled');
  });

  it('Should enable the Label and Description inputs when user has "update_vpc" permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: true,
      },
    });
    const { getByLabelText } = renderWithTheme(<VPCEditDrawer {...props} />);

    const labelInput = getByLabelText('Label');
    expect(labelInput).not.toHaveAttribute('disabled');

    const descriptionInput = getByLabelText('Description');
    expect(descriptionInput).not.toHaveAttribute('disabled');
  });

  it('Should render IPv4 Ranges section when feature flag is enabled', () => {
    vi.spyOn(VPCUtils, 'useIsCustomVPCIPv4RangesEnabled').mockReturnValue({
      isCustomVPCIPv4RangesEnabled: true,
    });
    const { getByText } = renderWithTheme(<VPCEditDrawer {...props} />);
    const ipv4Label = getByText('VPC IPv4 Range (CIDR)');
    expect(ipv4Label).toBeVisible();
  });

  it('Should not render IPv4 Ranges section when feature flag is disabled', () => {
    vi.spyOn(VPCUtils, 'useIsCustomVPCIPv4RangesEnabled').mockReturnValue({
      isCustomVPCIPv4RangesEnabled: false,
    });
    const { queryByText } = renderWithTheme(<VPCEditDrawer {...props} />);
    const ipv4Label = queryByText('VPC IPv4 Range (CIDR)');
    expect(ipv4Label).not.toBeInTheDocument();
  });

  it('Should disable IPv4 Ranges when user does not have "update_vpc" permission', () => {
    vi.spyOn(VPCUtils, 'useIsCustomVPCIPv4RangesEnabled').mockReturnValue({
      isCustomVPCIPv4RangesEnabled: true,
    });
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: false,
      },
    });
    const { getByText } = renderWithTheme(<VPCEditDrawer {...props} />);
    const addRangeButton = getByText('Add IPv4 Range').closest('button');
    expect(addRangeButton).toHaveAttribute('disabled');
  });

  it('Should enable IPv4 Ranges when user has "update_vpc" permission', () => {
    vi.spyOn(VPCUtils, 'useIsCustomVPCIPv4RangesEnabled').mockReturnValue({
      isCustomVPCIPv4RangesEnabled: true,
    });
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_vpc: true,
      },
    });
    const { getByText } = renderWithTheme(<VPCEditDrawer {...props} />);
    const addRangeButton = getByText('Add IPv4 Range').closest('button');
    expect(addRangeButton).not.toHaveAttribute('disabled');
  });

  it('Should display IPv4 Ranges from VPC data', () => {
    vi.spyOn(VPCUtils, 'useIsCustomVPCIPv4RangesEnabled').mockReturnValue({
      isCustomVPCIPv4RangesEnabled: true,
    });
    const vpcWithIPv4 = vpcFactory.build({
      ipv4: [{ range: '10.0.0.0/24' }, { range: '10.1.0.0/24' }],
    });
    const { getByDisplayValue } = renderWithTheme(
      <VPCEditDrawer {...props} vpc={vpcWithIPv4} />
    );
    getByDisplayValue('10.0.0.0/24');
    getByDisplayValue('10.1.0.0/24');
  });
});
