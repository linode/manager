import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { firewallDeviceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallDeviceRow } from './FirewallDeviceRow';

import type { FirewallDeviceEntityType } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

const props = {
  device: firewallDeviceFactory.build(),
  disabled: false,
  handleRemoveDevice: vi.fn(),
  isLinodeRelatedDevice: true,
};

describe('FirewallDeviceRow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows the network interface type if the feature flag is enabled for Linode related devices', () => {
    queryMocks.useFlags.mockReturnValue({
      linodeInterfaces: {
        enabled: true,
      },
    });
    const { getAllByRole, getByText } = renderWithTheme(
      <FirewallDeviceRow {...props} />
    );

    expect(getByText('entity')).toBeVisible();
    expect(getByText('Configuration Profile Interface')).toBeVisible();
    expect(getAllByRole('cell')).toHaveLength(3);
    expect(getByText('Remove')).toBeVisible();
  });

  it('does not show the network interface type if the feature flag is not enabled for Linode related devices', () => {
    queryMocks.useFlags.mockReturnValue({
      linodeInterfaces: {
        enabled: false,
      },
    });
    const { getAllByRole, getByText, queryByText } = renderWithTheme(
      <FirewallDeviceRow {...props} />
    );

    expect(getByText('entity')).toBeVisible();
    expect(
      queryByText('Configuration Profile Interface')
    ).not.toBeInTheDocument();
    expect(getAllByRole('cell')).toHaveLength(2);
    expect(getByText('Remove')).toBeVisible();
  });

  it('does not show the network interface type if the feature flag is not enabled for nodebalancer devices', () => {
    queryMocks.useFlags.mockReturnValue({
      linodeInterfaces: {
        enabled: false,
      },
    });
    const nodeBalancerEntity = firewallDeviceFactory.build({
      entity: {
        id: 10,
        label: 'entity',
        type: 'nodebalancer' as FirewallDeviceEntityType,
        url: '/linodes/1',
      },
    });

    const { getAllByRole, getByText, queryByText } = renderWithTheme(
      <FirewallDeviceRow
        {...props}
        device={nodeBalancerEntity}
        isLinodeRelatedDevice={false}
      />
    );

    expect(getByText('entity')).toBeVisible();
    expect(
      queryByText('Configuration Profile Interface')
    ).not.toBeInTheDocument();
    expect(getAllByRole('cell')).toHaveLength(2);
    expect(getByText('Remove')).toBeVisible();
  });

  it('can remove a device with an enabled Remove button', async () => {
    queryMocks.useFlags.mockReturnValue({
      linodeInterfaces: {
        enabled: true,
      },
    });
    const { getByText } = renderWithTheme(<FirewallDeviceRow {...props} />);

    const removeButton = getByText('Remove');
    await userEvent.click(removeButton);
    expect(props.handleRemoveDevice).toHaveBeenCalledTimes(1);
  });

  it('cannot remove a device with an enabled Remove button', async () => {
    queryMocks.useFlags.mockReturnValue({
      linodeInterfaces: {
        enabled: true,
      },
    });
    const { getByText } = renderWithTheme(
      <FirewallDeviceRow {...props} disabled={true} />
    );

    const removeButton = getByText('Remove');
    await userEvent.click(removeButton);
    expect(props.handleRemoveDevice).not.toHaveBeenCalled();
  });
});
