import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { firewallDeviceFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

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
  usePermissions: vi.fn(() => ({
    data: {
      create_firewall_device: false,
    },
  })),
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

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

const baseProps = (
  type: FirewallDeviceEntityType
): FirewallDeviceLandingProps => ({
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

      if (serviceName !== 'Linode') {
        it(`should contain a disabled Add ${serviceName} button`, () => {
          queryMocks.usePermissions.mockReturnValue({
            data: {
              create_firewall_device: false,
            },
          });
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

      if (serviceName !== 'Linode') {
        it(`should contain an enabled Add ${serviceName} button`, () => {
          queryMocks.usePermissions.mockReturnValue({
            data: {
              create_firewall_device: true,
            },
          });
          const { getByTestId } = renderWithTheme(
            <FirewallDeviceLanding {...prop} />
          );
          const addButton = getByTestId('add-device-button');

          expect(addButton).toHaveAttribute('aria-disabled', 'false');
        });

        it(`should navigate to Add ${serviceName} To Firewall drawer when enabled`, async () => {
          queryMocks.usePermissions.mockReturnValue({
            data: {
              create_firewall_device: true,
            },
          });
          const mockNavigate = vi.fn();
          queryMocks.useNavigate.mockReturnValue(mockNavigate);

          const { getByTestId } = renderWithTheme(
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

      if (serviceName === 'Linode') {
        it('should disable "Add Linodes to Firewall" button if the user does not have create_firewall_device permission', async () => {
          queryMocks.usePermissions.mockReturnValue({
            data: {
              create_firewall_device: false,
            },
          });

          const { getByTestId } = await renderWithTheme(
            <FirewallDeviceLanding {...prop} />,
            {
              initialRoute: `/firewalls/1/linodes`,
            }
          );
          const addButton = getByTestId('add-device-button');
          expect(addButton).toBeInTheDocument();
          expect(addButton).toBeDisabled();
        });
        it('should enable "Add Linodes to Firewall" button if the user has create_firewall_device permission', async () => {
          queryMocks.usePermissions.mockReturnValue({
            data: {
              create_firewall_device: true,
            },
          });

          const { getByTestId } = await renderWithTheme(
            <FirewallDeviceLanding {...prop} />,
            {
              initialRoute: `/firewalls/1/linodes`,
            }
          );
          const addButton = getByTestId('add-device-button');
          expect(addButton).toBeInTheDocument();
          expect(addButton).toBeEnabled();
        });
      }
    });
  });
});
