import { fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router-dom';

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
  disabled: false,
  firewallID: 1,
  firewallLabel: 'test',
  type,
});

const disabledProps = (type: FirewallDeviceEntityType) => ({
  ...baseProps(type),
  disabled: true,
});

const services = ['linode', 'nodebalancer'];

services.forEach((service: FirewallDeviceEntityType) => {
  describe(`Firewall ${service} Service`, () => {
    const props = [baseProps(service), disabledProps(service)];

    props.forEach((prop) => {
      it(`should render the component with ${
        prop.disabled ? 'disabled' : 'enabled'
      } add ${service} button`, () => {
        server.use(
          rest.get('*/firewalls/*', (req, res, ctx) => {
            return res(ctx.json(firewallDeviceFactory.buildList(1)));
          })
        );
        const history = createMemoryHistory();
        const { getByRole, getByTestId } = renderWithTheme(
          <Router history={history}>
            <FirewallDeviceLanding {...prop} />
          </Router>
        );
        const addButton = getByTestId('add-device-button');
        const table = getByRole('table');

        expect(addButton).toBeInTheDocument();
        expect(table).toBeInTheDocument();

        if (prop.disabled) {
          expect(addButton).toBeDisabled();
          const permissionNotice = getByRole('alert');
          expect(permissionNotice).toBeInTheDocument();
        } else {
          expect(addButton).toBeEnabled();
          fireEvent.click(addButton);
          const baseUrl = '/';
          expect(history.location.pathname).toBe(baseUrl + '/add');
        }
      });
    });
  });
});
