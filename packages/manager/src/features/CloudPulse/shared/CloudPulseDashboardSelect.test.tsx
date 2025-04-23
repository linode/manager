import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { dashboardFactory, serviceTypesFactory } from 'src/factories';
import * as utils from 'src/features/CloudPulse/Utils/utils';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDashboardSelect } from './CloudPulseDashboardSelect';

import type { CloudPulseDashboardSelectProps } from './CloudPulseDashboardSelect';

const dashboardLabel = 'Factory Dashboard-1';
const props: CloudPulseDashboardSelectProps = {
  handleDashboardChange: vi.fn(),
};

const queryMocks = vi.hoisted(() => ({
  useCloudPulseDashboardsQuery: vi.fn().mockReturnValue({}),
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
}));
const mockDashboard = dashboardFactory.build();
const mockServiceTypesList = serviceTypesFactory.build();

vi.mock('src/queries/cloudpulse/dashboards', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/dashboards');
  return {
    ...actual,
    useCloudPulseDashboardsQuery: queryMocks.useCloudPulseDashboardsQuery,
  };
});

vi.mock('src/queries/cloudpulse/services', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');
  return {
    ...actual,
    useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  };
});

queryMocks.useCloudPulseDashboardsQuery.mockReturnValue({
  data: {
    data: [mockDashboard],
  },
  error: false,
  isLoading: false,
});

queryMocks.useCloudPulseServiceTypes.mockReturnValue({
  data: {
    data: [mockServiceTypesList],
  },
});

vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
  data: [mockDashboard],
  error: '',
  isLoading: false,
});

describe('CloudPulse Dashboard select', () => {
  it('Should render dashboard select component', () => {
    const { getByPlaceholderText, getByTestId } = renderWithTheme(
      <CloudPulseDashboardSelect {...props} />
    );

    expect(getByTestId('cloudpulse-dashboard-select')).toBeInTheDocument();
    expect(getByPlaceholderText('Select a Dashboard')).toBeInTheDocument();
  });
  it('Should render dashboard select component with data', () => {
    renderWithTheme(<CloudPulseDashboardSelect {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(
      screen.getByRole('option', { name: dashboardLabel })
    ).toBeInTheDocument();
  });
  it('Should select the option on click', () => {
    renderWithTheme(<CloudPulseDashboardSelect {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: dashboardLabel }));

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'value',
      dashboardLabel
    );
  });
  it('Should select the default value from preferences', () => {
    renderWithTheme(
      <CloudPulseDashboardSelect {...props} defaultValue={1} savePreferences />
    );

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'value',
      dashboardLabel
    );
  });

  it('Should show error message when only dashboard call fails', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [],
      error: 'some error',
      isLoading: false,
    });

    renderWithTheme(<CloudPulseDashboardSelect {...props} savePreferences />);

    expect(
      screen.getByText('Failed to fetch the dashboards.')
    ).toBeInTheDocument();
  });
  it('Should show error message when services call fails', () => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: undefined,
      error: 'an error happened',
      isLoading: false,
    });

    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [],
      error: 'some error',
      isLoading: false,
    });

    renderWithTheme(<CloudPulseDashboardSelect {...props} savePreferences />);

    expect(
      screen.getByText('Failed to fetch the services.')
    ).toBeInTheDocument();
  });
});
