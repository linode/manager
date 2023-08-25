import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  FirewallDeviceLanding,
  FirewallDeviceLandingProps,
} from './FirewallDeviceLanding';

const linodeProps: FirewallDeviceLandingProps = {
  disabled: true,
  firewallID: 1,
  firewallLabel: 'test',
  type: 'linode',
};

const nodeBalancerProps: FirewallDeviceLandingProps = {
  ...linodeProps,
  type: 'nodebalancer',
};

jest.mock('src/queries/firewalls', () => ({
  useAllFirewallDevicesQuery: jest.fn(() => ({
    data: [],
    error: null,
    isLoading: false,
  })),
}));

describe('Firewall linode device', () => {
  let addLinodesButton: HTMLElement;

  beforeEach(() => {
    const { getByTestId } = renderWithTheme(
      <FirewallDeviceLanding {...linodeProps} />
    );
    addLinodesButton = getByTestId('add-device-button');
  });

  it('should render an add Linodes button', () => {
    expect(addLinodesButton).toBeInTheDocument();
  });

  it('should render a disabled add Linodes button', () => {
    expect(addLinodesButton).toBeDisabled();
  });
});

describe('Firewall nodebalancer device', () => {
  let addNodeBalancersButton: HTMLElement;

  beforeEach(() => {
    const { getByTestId } = renderWithTheme(
      <FirewallDeviceLanding {...nodeBalancerProps} />
    );
    addNodeBalancersButton = getByTestId('add-device-button');
  });
  it('should render an add NodeBalancer button', () => {
    expect(addNodeBalancersButton).toBeInTheDocument();
  });
  it('should render a disabled add NodeBalancer button', () => {
    expect(addNodeBalancersButton).toBeDisabled();
  });
});
