import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import * as utils from 'src/features/CloudPulse/Utils/utils';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DASHBOARD_ID } from '../Utils/constants';
import * as preferences from '../Utils/UserPreference';
import { CloudPulseDashboardSelect } from './CloudPulseDashboardSelect';

import type { CloudPulseDashboardSelectProps } from './CloudPulseDashboardSelect';
import type { AclpConfig } from '@linode/api-v4';

const dashboardLabel = 'Factory Dashboard-1';
const props: CloudPulseDashboardSelectProps = {
  handleDashboardChange: vi.fn(),
};

const queryMocks = vi.hoisted(() => ({
  useCloudPulseDashboardsQuery: vi.fn().mockReturnValue({}),
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
}));
const mockDashboard = dashboardFactory.build();

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
    data: [{ service_type: 'linode' }],
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
    expect(getByPlaceholderText('Select Dashboard')).toBeInTheDocument();
  }),
    it('Should render dashboard select component with data', () => {
      renderWithTheme(<CloudPulseDashboardSelect {...props} />);

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));

      expect(
        screen.getByRole('option', { name: dashboardLabel })
      ).toBeInTheDocument();
    }),
    it('Should select the option on click', () => {
      renderWithTheme(<CloudPulseDashboardSelect {...props} />);

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      fireEvent.click(screen.getByRole('option', { name: dashboardLabel }));

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'value',
        dashboardLabel
      );
    }),
    it('Should select the default value from preferences', () => {
      const mockFunction = vi.spyOn(preferences, 'getUserPreferenceObject');
      mockFunction.mockReturnValue({ [DASHBOARD_ID]: 1 } as AclpConfig);

      renderWithTheme(<CloudPulseDashboardSelect {...props} />);

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'value',
        dashboardLabel
      );
    });
});
