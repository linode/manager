import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetLinodeActionMenu } from './SubnetLinodeActionMenu';

beforeAll(() => mockMatchMedia());
const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      reboot_linode: true,
      boot_linode: true,
      shutdown_linode: true,
      delete_linode: true,
    },
  })),
  useQueryWithPermissions: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));
const props = {
  handlePowerActionsLinode: vi.fn(),
  handleUnassignLinode: vi.fn(),
  linode: linodeFactory.build({ label: 'linode-1' }),
  subnet: subnetFactory.build({ label: 'subnet-1' }),
  isOffline: false,
  isRebootNeeded: false,
  showPowerButton: true,
};

describe('SubnetActionMenu', () => {
  it('should render the subnet action menu', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <SubnetLinodeActionMenu {...props} />
    );
    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet subnet-1`
    );
    await userEvent.click(actionMenu);
    getByText('Power Off');
    getByText('Unassign Linode');
  });

  it('should allow the reboot button to be clicked', async () => {
    const { getByLabelText, getByText, queryByLabelText } = renderWithTheme(
      <SubnetLinodeActionMenu {...props} isRebootNeeded={true} />
    );
    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet subnet-1`
    );
    await userEvent.click(actionMenu);

    const rebootButton = getByText('Reboot');
    await userEvent.click(rebootButton);
    expect(props.handlePowerActionsLinode).toHaveBeenCalled();
    const tooltipText = queryByLabelText(
      'Linodes assigned to a subnet must be unassigned before the subnet can be deleted.'
    );
    expect(tooltipText).not.toBeInTheDocument();
  });

  it('should allow the Power Off button to be clicked', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <SubnetLinodeActionMenu {...props} />
    );
    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet subnet-1`
    );
    await userEvent.click(actionMenu);

    const powerOffButton = getByText('Power Off');
    await userEvent.click(powerOffButton);
    expect(props.handlePowerActionsLinode).toHaveBeenCalled();
  });

  it('should allow the Power On button to be clicked', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <SubnetLinodeActionMenu {...props} isOffline={true} />
    );
    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet subnet-1`
    );
    await userEvent.click(actionMenu);

    const powerOnButton = getByText('Power On');
    await userEvent.click(powerOnButton);
    expect(props.handlePowerActionsLinode).toHaveBeenCalled();
  });

  it('should allow the Unassign Linode button to be clicked', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <SubnetLinodeActionMenu {...props} />
    );
    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet subnet-1`
    );
    await userEvent.click(actionMenu);

    const unassignButton = getByText('Unassign Linode');
    await userEvent.click(unassignButton);
    expect(props.handleUnassignLinode).toHaveBeenCalled();
  });
  it('should disable the "Unassign Linode" and "Power On" buttons when user does not have permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_linode: false,
        reboot_linode: false,
        boot_linode: false,
        shutdown_linode: false,
      },
    });
    const { getByLabelText, getByTestId } = renderWithTheme(
      <SubnetLinodeActionMenu {...props} isOffline={true} />
    );
    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet subnet-1`
    );
    await userEvent.click(actionMenu);

    const unassignButton = getByTestId('Unassign Linode');
    expect(unassignButton).toHaveAttribute('aria-disabled', 'true');

    const powerOnButton = getByTestId('Power On');
    expect(powerOnButton).toHaveAttribute('aria-disabled', 'true');
  });
  it('should enable the "Unassign Linode" and "Power On" buttons when user has permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_linode: true,
        reboot_linode: true,
        boot_linode: true,
        shutdown_linode: false,
      },
    });
    const { getByLabelText, getByTestId } = renderWithTheme(
      <SubnetLinodeActionMenu {...props} isOffline={true} />
    );
    const actionMenu = getByLabelText(
      `Action menu for Linodes in Subnet subnet-1`
    );
    await userEvent.click(actionMenu);

    const unassignButton = getByTestId('Unassign Linode');
    expect(unassignButton).not.toHaveAttribute('aria-disabled', 'true');
    const powerOnButton = getByTestId('Power On');
    expect(powerOnButton).not.toHaveAttribute('aria-disabled', 'true');
  });
});
