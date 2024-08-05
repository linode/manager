import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DASHBOARD_ID } from '../Utils/constants';
import * as preferences from '../Utils/UserPreference';
import { CloudPulseDashboardSelect } from './CloudPulseDashboardSelect';

import type { CloudPulseDashboardSelectProps } from './CloudPulseDashboardSelect';
import type { AclpConfig } from '@linode/api-v4';

const dashboardLabel = 'Dashboard 1';
const props: CloudPulseDashboardSelectProps = {
  handleDashboardChange: vi.fn(),
};

const queryMocks = vi.hoisted(() => ({
  useCloudPulseDashboardsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/dashboards', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/dashboards');
  return {
    ...actual,
    useCloudPulseDashboardsQuery: queryMocks.useCloudPulseDashboardsQuery,
  };
});

queryMocks.useCloudPulseDashboardsQuery.mockReturnValue({
  data: {
    data: [
      {
        created: '2024-04-29T17:09:29',
        id: 1,
        label: dashboardLabel,
        service_type: 'linode',
        type: 'standard',
        updated: null,
        widgets: {},
      },
    ],
  },
  error: false,
  isLoading: false,
});

describe('CloudPulse Dashboard select', () => {
  it('Should render dashboard select component', () => {
    const { getByPlaceholderText, getByTestId } = renderWithTheme(
      <CloudPulseDashboardSelect {...props} />
    );

    expect(getByTestId('cloudpulse-dashboard-select')).toBeInTheDocument();
    expect(getByPlaceholderText('Select a Dashboard')).toBeInTheDocument();
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
