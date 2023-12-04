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
  firewallId: 1,
  firewallLabel: 'test',
  type,
});

const disabledProps = (type: FirewallDeviceEntityType) => ({
  ...baseProps(type),
  disabled: true,
});

const services = ['linode', 'nodebalancer'];

services.forEach((service: FirewallDeviceEntityType) => {
  const serviceName = service === 'linode' ? 'Linode' : 'NodeBalancer';

  describe(`Firewall ${serviceName} landing page`, () => {
    const props = [baseProps(service), disabledProps(service)];

    props.forEach((prop) => {
      it('should render the component', () => {
        server.use(
          rest.get('*/firewalls/*', (req, res, ctx) => {
            return res(ctx.json(firewallDeviceFactory.buildList(1)));
          })
        );
        const { getByRole, getByTestId } = renderWithTheme(
          <FirewallDeviceLanding {...prop} />
        );
        const addButton = getByTestId('add-device-button');
        const table = getByRole('table');

        expect(addButton).toBeInTheDocument();
        expect(table).toBeInTheDocument();
      });

      it(`should contain ${
        prop.disabled ? 'disabled' : 'enabled'
      } Add ${serviceName} button`, () => {
        const { getByTestId } = renderWithTheme(
          <FirewallDeviceLanding {...prop} />
        );
        const addButton = getByTestId('add-device-button');

        if (prop.disabled) {
          expect(addButton).toBeDisabled();
        } else {
          expect(addButton).toBeEnabled();
        }
      });

      if (prop.disabled) {
        it(`should contain a disabled Add ${serviceName} button`, () => {
          const { getByTestId } = renderWithTheme(
            <FirewallDeviceLanding {...prop} />
          );
          const addButton = getByTestId('add-device-button');

          expect(addButton).toBeDisabled();
        });
        it('should contain permission notice when disabled', () => {
          const { getByRole } = renderWithTheme(
            <FirewallDeviceLanding {...prop} />
          );
          const permissionNotice = getByRole('alert');
          expect(permissionNotice).toBeInTheDocument();
        });
      }

      if (!prop.disabled) {
        it(`should contain an enabled Add ${serviceName} button`, () => {
          const { getByTestId } = renderWithTheme(
            <FirewallDeviceLanding {...prop} />
          );
          const addButton = getByTestId('add-device-button');

          expect(addButton).toBeEnabled();
        });
        it(`should navigate to Add ${serviceName} To Firewall drawer when enabled`, () => {
          const history = createMemoryHistory();
          const { getByTestId } = renderWithTheme(
            <Router history={history}>
              <FirewallDeviceLanding {...prop} />
            </Router>
          );
          const addButton = getByTestId('add-device-button');
          fireEvent.click(addButton);
          const baseUrl = '/';
          expect(history.location.pathname).toBe(baseUrl + '/add');
        });
      }
    });
  });
});
