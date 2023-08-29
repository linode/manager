import * as React from 'react';

import { firewallDeviceFactory } from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  FirewallDeviceLanding,
  FirewallDeviceLandingProps,
} from './FirewallDeviceLanding';

import type { FirewallDeviceEntityType } from '@linode/api-v4';

const baseProps = (
  type: FirewallDeviceEntityType
): FirewallDeviceLandingProps => ({
  disabled: true,
  firewallID: 1,
  firewallLabel: 'test',
  type,
});

const devices = ['linode', 'nodebalancer'];

devices.forEach((device: FirewallDeviceEntityType) => {
  describe(`Firewall ${device} device`, () => {
    let addButton: HTMLElement;
    let permissionNotice: HTMLElement;
    let table: HTMLElement;

    beforeEach(() => {
      server.use(
        rest.get('*/firewalls/*', (req, res, ctx) => {
          return res(ctx.json(firewallDeviceFactory.buildList(1)));
        })
      );
      const { getByRole, getByTestId } = renderWithTheme(
        <FirewallDeviceLanding {...baseProps(device)} />
      );
      addButton = getByTestId('add-device-button');
      permissionNotice = getByRole('alert');
      table = getByRole('table');
    });

    it(`should render an add ${device} button`, () => {
      expect(addButton).toBeInTheDocument();
    });

    it(`should render a disabled add ${device} button`, () => {
      expect(addButton).toBeDisabled();
    });

    it(`should render a permission denied notice`, () => {
      expect(permissionNotice).toBeInTheDocument();
    });

    it(`should render a table`, () => {
      expect(table).toBeInTheDocument();
    });
  });
});
