import React from 'react';

import {
  alertFactory,
  cpuRulesFactory,
  serviceTypesFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import { severityMap } from '../constants';
import { AlertDetailOverview } from './AlertDetailOverview';

// Mock Data
const serviceTypes = serviceTypesFactory.buildList(1, {
  label: 'Databases',
  service_type: 'dbaas',
});

const alertDetails = alertFactory.build({
  description: 'This is test description',
  label: 'Test alert',
  severity: 3,
});

const metricDefinitions = cpuRulesFactory.build();
// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useCloudPulseServiceTypes: vi.fn(),
  useGetCloudPulseMetricDefinitionsByServiceType: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/services', () => ({
  ...vi.importActual('src/queries/cloudpulse/services'),
  useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  useGetCloudPulseMetricDefinitionsByServiceType:
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType,
}));

// Shared Setup
beforeEach(() => {
  queryMocks.useCloudPulseServiceTypes.mockReturnValue({
    data: { data: serviceTypes },
    isError: false,
    isFetching: false,
  });
  queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
    data: { data: [] },
    isError: false,
    isFetching: false,
  });
});

describe('AlertDetailOverview component tests', () => {
  it('should render alert detail overview with required props', () => {
    const { getByText } = renderWithTheme(
      <AlertDetailOverview alertDetails={alertDetails} />
    );

    const { description, label, severity, type } = alertDetails;

    expect(getByText(description)).toBeInTheDocument();
    expect(getByText(severityMap[severity])).toBeInTheDocument();
    expect(getByText(label)).toBeInTheDocument();
    expect(
      getByText(convertStringToCamelCasesWithSpaces(type))
    ).toBeInTheDocument();
  });

  it('should render circle progress if the service types call is fetching', () => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: { data: serviceTypes },
      isError: false,
      isFetching: true,
    });
    const { getByTestId, queryByText } = renderWithTheme(
      <AlertDetailOverview alertDetails={alertDetails} />
    );

    expect(getByTestId('circle-progress')).toBeInTheDocument();
    expect(queryByText('Overview')).not.toBeInTheDocument();
  });
  it('should render circle progress if the metric definitions call is fetching', () => {
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: { data: serviceTypes },
      isError: false,
      isFetching: true,
    });
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: { data: [metricDefinitions] },
      isError: false,
      isFetching: false,
    });
    const { getByTestId, queryByText } = renderWithTheme(
      <AlertDetailOverview alertDetails={alertDetails} />
    );

    expect(getByTestId('circle-progress')).toBeVisible();
    expect(queryByText('Overview')).not.toBeInTheDocument();
  });
});
