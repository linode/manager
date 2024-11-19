import { fireEvent, screen } from '@testing-library/react';
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

describe('ServiceTypeSelect component tests', () => {
  it('should render the Autocomplete component', () => {
    const { getAllByText, getByTestId } = renderWithThemeAndHookFormContext({
      component: <CloudPulseServiceSelect name="service_type" />,
    });
    expect(getByTestId('servicetype-select')).toBeInTheDocument();
    getAllByText('Service');
  });

  it('should render service types happy path', () => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndHookFormContext({
      component: <CloudPulseServiceSelect name="service_type" />,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', {
        name: 'Linode',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'Databases',
      })
    ).toBeInTheDocument();
  });

  it('should be able to select a service type', () => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndHookFormContext({
      component: <CloudPulseServiceSelect name="service_type" />,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'Linode' }));
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Linode');
  });
  it('should render error messages when there is an API call failure', () => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      status: 'error',
    });
    renderWithThemeAndHookFormContext({
      component: <CloudPulseServiceSelect name="service_type" />,
    });
    expect(
      screen.getByText('Failed to fetch the service types.')
    ).toBeInTheDocument();
  });
});
