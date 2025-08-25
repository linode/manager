import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetLinodeActionMenu } from './SubnetLinodeActionMenu';

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
});
