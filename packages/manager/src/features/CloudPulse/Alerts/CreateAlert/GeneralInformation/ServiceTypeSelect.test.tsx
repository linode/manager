import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { serviceTypesFactory } from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseServiceSelect } from './ServiceTypeSelect';

const queryMocks = vi.hoisted(() => ({
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/services', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');
  return {
    ...actual,
    useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  };
});

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

queryMocks.useCloudPulseServiceTypes.mockReturnValue({
  data: mockResponse,
  isError: true,
  isLoading: false,
  status: 'success',
});
describe('ServiceTypeSelect component tests', () => {
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
        name: 'Linode',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'Databases',
      })
    ).toBeInTheDocument();
  });

  it('should be able to select a service type', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseServiceSelect isDisabled={false} name="serviceType" />
      ),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Linode' })
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
});
