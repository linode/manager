import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  CloudPulseDashboardSelect,
  CloudPulseDashboardSelectProps,
} from './CloudPulseDashboardSelect';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

const props: CloudPulseDashboardSelectProps = {
  handleDashboardChange: vi.fn(),
};

const queryMocks = vi.hoisted(() => ({
  useCloudViewDashboardsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/dashboards', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/dashboards');
  return {
    ...actual,
    useCloudViewDashboardsQuery: queryMocks.useCloudViewDashboardsQuery,
  };
});

queryMocks.useCloudViewDashboardsQuery.mockReturnValue({
  data: {
    data: [
      {
        id: 1,
        type: 'standard',
        service_type: 'linode',
        label: 'Dashboard 1',
        created: '2024-04-29T17:09:29',
        updated: null,
        widgets: {},
      },
    ],
  },
  isLoading: false,
  error: false,
});

describe('CloudPulse Dashboard select', () => {
  it('Should render dashboard select component', () => {
    const { getByTestId, getByPlaceholderText } = renderWithTheme(
      <CloudPulseDashboardSelect {...props} />
    );

    expect(getByTestId('cloudview-dashboard-select')).toBeInTheDocument();
    expect(getByPlaceholderText('Select a Dashboard')).toBeInTheDocument();
  }),
    it('Should render dashboard select component with data', () => {
      renderWithTheme(<CloudPulseDashboardSelect {...props} />);

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));

      expect(
        screen.getByRole('option', { name: 'Dashboard 1' })
      ).toBeInTheDocument();
    }),
    it('Should select the option on click', () => {
      renderWithTheme(<CloudPulseDashboardSelect {...props} />);

      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      fireEvent.click(screen.getByRole('option', { name: 'Dashboard 1' }));

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'value',
        'Dashboard 1'
      );
    });
});
