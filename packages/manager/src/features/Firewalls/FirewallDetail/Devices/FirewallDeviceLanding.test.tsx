import * as React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
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

devices.forEach((device) => {
  describe(`Firewall ${device} device`, () => {
    let addButton: HTMLElement;

    beforeEach(() => {
      server.use(
        rest.get('*/firewalls/*', (req, res, ctx) => {
          return res(ctx.json(makeResourcePage([])));
        })
      );
      const { getByTestId } = renderWithTheme(
        <FirewallDeviceLanding
          {...baseProps(device as FirewallDeviceEntityType)}
        />
      );
      addButton = getByTestId('add-device-button');
    });

    it(`should render an add ${
      device.charAt(0).toUpperCase() + device.slice(1)
    } button`, () => {
      expect(addButton).toBeInTheDocument();
    });

    it(`should render a disabled add ${
      device.charAt(0).toUpperCase() + device.slice(1)
    } button`, () => {
      expect(addButton).toBeDisabled();
    });
  });
});
