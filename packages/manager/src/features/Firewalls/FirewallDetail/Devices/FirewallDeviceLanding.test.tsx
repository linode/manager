import * as React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
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

describe('Firewall linode device', () => {
  let addLinodesButton: HTMLElement;

  beforeEach(() => {
    server.use(
      rest.get('*/firewalls/*', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );
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
