import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { serviceTypesFactory } from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseServiceSelect } from './ServiceTypeSelect';

import type { AclpServices } from 'src/featureFlags';

const queryMocks = vi.hoisted(() => ({
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
  useFlags: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/services', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');
  return {
    ...actual,
    useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  };
});

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
}));

const mockResponse = {
  data: [
    serviceTypesFactory.build({
      label: 'Linode',
      service_type: 'linode',
    }),
    serviceTypesFactory.build({
      label: 'Databases',
      service_type: 'dbaas',
    }),
  ],
};

const aclpServicesFlag: Partial<AclpServices> = {
  linode: {
    alerts: { enabled: true, beta: true },
    metrics: { enabled: true, beta: true },
  },
  dbaas: {
    alerts: { enabled: true, beta: true },
    metrics: { enabled: true, beta: true },
  },
};

const linodeLabel = 'Linode beta';
const databasesLabel = 'Databases beta';

describe('ServiceTypeSelect component tests', () => {
  beforeEach(() => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    queryMocks.useFlags.mockReturnValue({
      aclpServices: aclpServicesFlag,
    });
  });

  it('should render the Autocomplete component', () => {
    const { getAllByText, getByTestId } = renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
      ),
    });
    expect(getByTestId('servicetype-select')).toBeInTheDocument();
    getAllByText('Service');
  });

  it('should render service types happy path', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
      ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      await screen.findByRole('option', {
        name: linodeLabel,
      })
    ).toBeVisible();
    expect(
      screen.getByRole('option', {
        name: databasesLabel,
      })
    ).toBeVisible();
  });

  it('should be able to select a service type', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
      ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: linodeLabel })
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Linode');
  });

  it('should render error messages when there is an API call failure', () => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: undefined,
      error: 'an error happened',
      isLoading: false,
    });
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
      ),
    });
    expect(
      screen.getByText('Failed to fetch the service types.')
    ).toBeInTheDocument();
  });

  it('should render the service types based on the aclp services flag', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: {
        linode: {
          alerts: { enabled: true, beta: true },
          metrics: { enabled: true, beta: true },
        },
        dbaas: {
          alerts: { enabled: false, beta: true },
          metrics: { enabled: false, beta: true },
        },
      },
    });

    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
      ),
    });
    const serviceFilterDropdown = screen.getByTestId('servicetype-select');
    await userEvent.click(
      within(serviceFilterDropdown).getByRole('button', { name: 'Open' })
    );
    expect(screen.getByRole('option', { name: linodeLabel })).toBeVisible();
    expect(screen.queryByRole('option', { name: databasesLabel })).toBeNull(); // Verify that Databases is NOT present (filtered out by the flag)
  });

  it('should not return service types that are missing in the flag', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: {
        linode: {
          alerts: { enabled: true, beta: true },
          metrics: { enabled: true, beta: true },
        },
      },
    });

    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
      ),
    });
    const serviceFilterDropdown = screen.getByTestId('servicetype-select');
    await userEvent.click(
      within(serviceFilterDropdown).getByRole('button', { name: 'Open' })
    );
    expect(screen.getByRole('option', { name: linodeLabel })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Databases' })).toBeNull();
  });

  it('should not return service types that are missing the alerts property in the flag', async () => {
    queryMocks.useFlags.mockReturnValue({
      aclpServices: {
        linode: {
          metrics: { enabled: true, beta: true },
        },
      },
    });

    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
      ),
    });
    const serviceFilterDropdown = screen.getByTestId('servicetype-select');
    await userEvent.click(
      within(serviceFilterDropdown).getByRole('button', { name: 'Open' })
    );
    expect(screen.queryByRole('option', { name: 'Linode' })).toBeNull();
  });
});
