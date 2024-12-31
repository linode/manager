import React from 'react';

import { alertFactory, serviceTypesFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import { severityMap } from '../constants';
import { AlertDetailOverview } from './AlertDetailOverview';

// Mock Data
const serviceTypes = serviceTypesFactory.buildList(1, {
  label: 'Databases',
  service_type: 'dbaas',
});
// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useCloudPulseServiceTypes: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/services', () => ({
  ...vi.importActual('src/queries/cloudpulse/services'),
  useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
}));

// Shared Setup
beforeEach(() => {
  queryMocks.useCloudPulseServiceTypes.mockReturnValue({
    data: { data: serviceTypes },
    isError: false,
    isFetching: false,
  });
});

describe('AlertDetailOverview component tests', () => {
  it('should render alert detail overview with required props', () => {
    const alertDetails = alertFactory.build({
      description: 'This is test description',
      label: 'Test alert',
      severity: 3,
    });
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
    const alert = alertFactory.build({
      description: 'This is test description',
      label: 'Test alert',
      severity: 3,
    });
    const { getByTestId, queryByText } = renderWithTheme(
      <AlertDetailOverview alertDetails={alert} />
    );

    expect(getByTestId('circle-progress')).toBeInTheDocument();
    expect(queryByText('Overview')).not.toBeInTheDocument();
  });
});
