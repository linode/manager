import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import * as utils from 'src/features/CloudPulse/Utils/utils';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDashboardWithFilters } from './CloudPulseDashboardWithFilters';

import type { GroupByOption } from '../GroupBy/CloudPulseGroupByDrawer';

const queryMocks = vi.hoisted(() => ({
  useCloudPulseDashboardsQuery: vi.fn().mockReturnValue({}),
  useGlobalDimensions: vi.fn().mockReturnValue({}),
}));

const circleProgress = 'circle-progress';
const mandatoryFiltersError = 'Select filters to visualize metrics.';
const mockGroupByOptions: GroupByOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

vi.mock('src/queries/cloudpulse/dashboards', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/dashboards');
  return {
    ...actual,
    useCloudPulseDashboardsQuery: queryMocks.useCloudPulseDashboardsQuery,
  };
});
vi.mock('../GroupBy/utils', async () => {
  const actual = await vi.importActual('../GroupBy/utils');

  return {
    ...actual,
    useGlobalDimensions: queryMocks.useGlobalDimensions,
  };
});
const mockDashboard = dashboardFactory.build();

describe('CloudPulseDashboardWithFilters component tests', () => {
  it('renders a CloudPulseDashboardWithFilters component with error placeholder', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [],
      error: 'test error',
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType="dbaas" />
    );

    const error = screen.getByText('Error loading dashboards');
    expect(error).toBeDefined();
  });

  it('renders a CloudPulseDashboardWithFilters component successfully without error placeholders', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [],
      error: '',
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType="dbaas" />
    );

    const circle = screen.getByTestId(circleProgress);
    expect(circle).toBeDefined(); // the dashboards started to render
  });

  it('renders a CloudPulseDashboardWithFilters component successfully for dbaas', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [{ ...mockDashboard, service_type: 'dbaas' }],
      error: '',
      isLoading: false,
    });

    queryMocks.useGlobalDimensions.mockReturnValue({
      isLoading: false,
      options: mockGroupByOptions,
      defaultValue: [],
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType="dbaas" />
    );

    const groupByIcon = screen.getByTestId('group-by');
    expect(groupByIcon).toBeEnabled();

    const startDate = screen.getByText('Start Date');
    const nodeTypeSelect = screen.getByTestId('node-type-select');
    expect(startDate).toBeInTheDocument();
    expect(nodeTypeSelect).toBeInTheDocument();
  });

  it('renders a CloudPulseDashboardWithFilters component with mandatory filter error for dbaas', async () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [{ ...mockDashboard, service_type: 'dbaas' }],
      error: '',
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType="dbaas" />
    );
    const closeIcon = screen.getByTestId('CloseIcon');
    expect(closeIcon).toBeDefined();

    await userEvent.click(screen.getByTitle('Clear')); // clear the value

    const error = screen.getByText(mandatoryFiltersError);
    expect(error).toBeDefined();
  });

  it('renders a CloudPulseDashboardWithFilters component with no filters configured error', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [{ ...mockDashboard, id: 0 }],
      error: '',
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType={'dbaas'} />
    );

    const noFilterText = screen.getByText(
      'No Filters Configured for Dashboard with Id - 0'
    );
    expect(noFilterText).toBeDefined();
  });

  it('renders a CloudPulseDashboardWithFilters component successfully for nodebalancer', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [{ ...mockDashboard, service_type: 'nodebalancer', id: 3 }],
      error: '',
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType="nodebalancer" />
    );
    const startDate = screen.getByText('Start Date');
    const portsSelect = screen.getByPlaceholderText('e.g., 80,443,3000');
    expect(startDate).toBeInTheDocument();
    expect(portsSelect).toBeInTheDocument();
  });

  it('renders a CloudPulseDashboardWithFilters component successfully for firewall', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [
        { ...mockDashboard, service_type: 'firewall', id: 4 },
        { ...mockDashboard, service_type: 'firewall', id: 8 },
      ],
      error: '',
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType="firewall" />
    );
    const startDate = screen.getByText('Start Date');
    expect(startDate).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select a Linode Region')).toBeVisible();
    expect(screen.getByPlaceholderText('Select Interface Types')).toBeVisible();
    expect(screen.getByPlaceholderText('e.g., 1234,5678')).toBeVisible();
  });

  it('renders a CloudPulseDashboardWithFilters component successfully for objectstorage', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [{ ...mockDashboard, service_type: 'objectstorage', id: 6 }],
      error: '',
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters
        region="test"
        resource="test"
        serviceType="objectstorage"
      />
    );

    const startDate = screen.getByText('Start Date');
    expect(startDate).toBeInTheDocument();
  });

  it('renders a CloudPulseDashboardWithFilters component with mandatory filter error for objectstorage if region is not provided', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [{ ...mockDashboard, service_type: 'objectstorage', id: 6 }],
      error: '',
      isLoading: false,
    });
    renderWithTheme(
      <CloudPulseDashboardWithFilters
        resource={1}
        serviceType="objectstorage"
      />
    );
    const error = screen.getByText(mandatoryFiltersError);
    expect(error).toBeDefined();
  });

  it('renders a CloudPulseDashboardWithFilters component successfully for blockstorage', () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [{ ...mockDashboard, service_type: 'blockstorage', id: 7 }],
      error: '',
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType="blockstorage" />
    );

    const startDate = screen.getByText('Start Date');
    expect(startDate).toBeInTheDocument();
  });

  it('renders a CloudPulseDashboardWithFilters component successfully for firewall nodebalancer', async () => {
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [
        {
          ...mockDashboard,
          service_type: 'firewall',
          id: 4,
          label: 'linode_firewall_dashbaord',
        },
        {
          ...mockDashboard,
          service_type: 'firewall',
          id: 8,
          label: 'nodebalancer_firewall_dashbaord',
        },
      ],
      error: '',
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters resource={1} serviceType="firewall" />
    );

    const startDate = screen.getByText('Start Date');
    expect(startDate).toBeInTheDocument();
    await userEvent.click(screen.getByPlaceholderText('Select a Dashboard'));
    await userEvent.click(screen.getByText('nodebalancer_firewall_dashbaord'));
    expect(
      screen.getByPlaceholderText('Select a NodeBalancer Region')
    ).toBeVisible();
  });
  // it('renders a CloudPulseDashboardWithFilters component successfully with group by enabled', async () => {
  //   queryMocks.useGlobalDimensions.mockReturnValue({
  //     isLoading: false,
  //     options: mockGroupByOptions,
  //     defaultValue: [],
  //   });
  // });
});
