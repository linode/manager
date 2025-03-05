import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { firewallDeviceFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import {
  renderWithTheme,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import { FirewallDeviceLanding } from './FirewallDeviceLanding';

import type { FirewallDeviceLandingProps } from './FirewallDeviceLanding';
import type { FirewallDeviceEntityType } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useOrderV2: vi.fn().mockReturnValue({
    handleOrderChange: vi.fn(),
  }),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('src/hooks/useOrderV2', async () => {
  const actual = await vi.importActual('src/hooks/useOrderV2');
  return {
    ...actual,
    useOrderV2: queryMocks.useOrderV2,
  };
});

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
    beforeEach(() => {
      queryMocks.useLocation.mockReturnValue({
        pathname: '/firewalls/1/linodes',
      });
      queryMocks.useParams.mockReturnValue({
        id: '1',
      });
    });
    const props = [baseProps(service), disabledProps(service)];

    props.forEach((prop) => {
      it('should render the component', () => {
        server.use(
          http.get('*/firewalls/*', () => {
            return HttpResponse.json(firewallDeviceFactory.buildList(1));
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

      if (prop.disabled) {
        it(`should contain a disabled Add ${serviceName} button`, () => {
          const { getByTestId } = renderWithTheme(
            <FirewallDeviceLanding {...prop} />
          );
          const addButton = getByTestId('add-device-button');

          expect(addButton).toHaveAttribute('aria-disabled', 'true');
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

          expect(addButton).toHaveAttribute('aria-disabled', 'false');
        });

        it(`should navigate to Add ${serviceName} To Firewall drawer when enabled`, async () => {
          const mockNavigate = vi.fn();
          queryMocks.useNavigate.mockReturnValue(mockNavigate);

          const { getByTestId } = await renderWithThemeAndRouter(
            <FirewallDeviceLanding {...prop} />,
            {
              initialRoute: `/firewalls/1/${service}`,
            }
          );
          const addButton = getByTestId('add-device-button');
          fireEvent.click(addButton);

          await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({
              params: { id: '1' },
              to: `/firewalls/$id/${service}s/add`,
            });
          });
        });
      }
    });
  });
});
