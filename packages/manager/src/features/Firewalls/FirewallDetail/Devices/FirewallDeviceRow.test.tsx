import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { firewallDeviceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallDeviceRow } from './FirewallDeviceRow';

import type { FirewallDeviceEntityType } from '@linode/api-v4';

const props = {
  device: firewallDeviceFactory.build(),
  disabled: false,
  handleRemoveDevice: vi.fn(),
  isLinodeRelatedDevice: true,
};

const INTERFACE_TEXT = 'Configuration Profile Interface';

describe('FirewallDeviceRow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows the network interface type if the linodeInterfaces feature flag is enabled for Linode related devices', () => {
    const { getAllByRole, getByText } = renderWithTheme(
      <FirewallDeviceRow {...props} />,
      { flags: { linodeInterfaces: { enabled: true } } }
    );

    expect(getByText('entity')).toBeVisible();
    expect(getByText(INTERFACE_TEXT)).toBeVisible();
    expect(getAllByRole('cell')).toHaveLength(3);
    expect(getByText('Remove')).toBeVisible();
  });

  it('does not show the network interface type if the linodeInterfaces feature flag is not enabled for Linode related devices', () => {
    const { getAllByRole, getByText, queryByText } = renderWithTheme(
      <FirewallDeviceRow {...props} />,
      {
        flags: { linodeInterfaces: { enabled: false } },
      }
    );

    expect(getByText('entity')).toBeVisible();
    expect(queryByText(INTERFACE_TEXT)).not.toBeInTheDocument();
    expect(getAllByRole('cell')).toHaveLength(2);
    expect(getByText('Remove')).toBeVisible();
  });

  it('does not show the network interface type for nodebalancer devices', () => {
    const nodeBalancerEntity = firewallDeviceFactory.build({
      entity: {
        id: 10,
        label: 'entity',
        type: 'nodebalancer' as FirewallDeviceEntityType,
        url: '/linodes/1',
      },
    });

    const {
      getAllByRole,
      getByText,
      queryByText,
    } = renderWithTheme(
      <FirewallDeviceRow
        {...props}
        device={nodeBalancerEntity}
        isLinodeRelatedDevice={false}
      />,
      { flags: { linodeInterfaces: { enabled: true } } }
    );

    expect(getByText('entity')).toBeVisible();
    expect(queryByText(INTERFACE_TEXT)).not.toBeInTheDocument();
    expect(getAllByRole('cell')).toHaveLength(2);
    expect(getByText('Remove')).toBeVisible();
  });

  it('can remove a device with an enabled Remove button', async () => {
    const { getByText } = renderWithTheme(<FirewallDeviceRow {...props} />, {
      flags: { linodeInterfaces: { enabled: true } },
    });

    const removeButton = getByText('Remove');
    await userEvent.click(removeButton);
    expect(props.handleRemoveDevice).toHaveBeenCalledTimes(1);
  });

  it('cannot remove a device with a disabled Remove button', async () => {
    const { getByText } = renderWithTheme(
      <FirewallDeviceRow {...props} disabled={true} />,
      { flags: { linodeInterfaces: { enabled: true } } }
    );

    const removeButton = getByText('Remove');
    await userEvent.click(removeButton);
    expect(props.handleRemoveDevice).not.toHaveBeenCalled();
  });
});
