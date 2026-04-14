import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertReusableComponent } from './AlertReusableComponent';

const mockQuery = vi.hoisted(() => ({
  useAlertDefinitionByServiceTypeQuery: vi.fn(),
  useServiceAlertsMutation: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useAlertDefinitionByServiceTypeQuery:
      mockQuery.useAlertDefinitionByServiceTypeQuery,
    useServiceAlertsMutation: mockQuery.useServiceAlertsMutation,
  };
});
const serviceType = 'linode';
const entityId = '123';
const entityName = 'test-instance';
const region = 'us-ord';
const onToggleAlert = vi.fn();
const alerts = [
  ...alertFactory.buildList(3, {
    service_type: serviceType,
    regions: ['us-ord'],
  }),
  alertFactory.build({
    label: 'test-alert',
    service_type: serviceType,
    regions: ['us-ord'],
  }),
  ...alertFactory.buildList(7, {
    entity_ids: [entityId],
    service_type: serviceType,
  }),
  ...alertFactory.buildList(1, {
    entity_ids: [entityId],
    service_type: serviceType,
    regions: ['us-ord'],
    status: 'enabled',
    type: 'system',
  }),
];

const mockReturnValue = {
  data: alerts,
  isError: false,
  isLoading: false,
};

const component = (
  <AlertReusableComponent
    entityId={entityId}
    entityName={entityName}
    onToggleAlert={onToggleAlert}
    regionId={region}
    serviceType={serviceType}
  />
);

mockQuery.useAlertDefinitionByServiceTypeQuery.mockReturnValue(mockReturnValue);
mockQuery.useServiceAlertsMutation.mockReturnValue({
  mutateAsync: vi.fn(),
});

describe('Alert Resuable Component for contextual view', () => {
  it('Should go to alerts definition page on clicking manage alerts button', async () => {
    const { getByTestId, router } = renderWithTheme(component);
    await userEvent.click(getByTestId('manage-alerts'));

    expect(router.state.location.pathname).toBe('/alerts/definitions');
  });

  it('Should filter alerts based on search text', async () => {
    const { getByPlaceholderText, getByText, queryByText } =
      renderWithTheme(component);
    await userEvent.type(getByPlaceholderText('Search for Alerts'), 'Alert-1');
    await waitFor(() => {
      expect(getByText('Alert-1')).toBeVisible();
      expect(queryByText('Alert-3')).not.toBeInTheDocument();
    });
  });

  it('Should filter alerts based on alert type', async () => {
    const { getByRole, getByText } = renderWithTheme(component);

    await userEvent.click(getByRole('button', { name: 'Open' }));

    await userEvent.click(getByRole('option', { name: 'system' }));

    const alert = alerts[alerts.length - 1];
    expect(getByText(alert.label)).toBeInTheDocument();
  });

  it('Should hide manage alerts button for undefined entityId', () => {
    renderWithTheme(<AlertReusableComponent serviceType={serviceType} />);

    const manageAlerts = screen.queryByTestId('manage-alerts');
    expect(manageAlerts).not.toBeInTheDocument();
    expect(screen.queryByText('Alerts')).not.toBeInTheDocument();
  });

  it('Should filter alerts based on region', async () => {
    renderWithTheme(component);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('test-alert')).toBeVisible();
  });

  it('Should show header for edit mode', async () => {
    // For service types not in SERVICES_WITH_MANAGE_ALERTS_IN_FILTER_ROW (e.g. dbaas),
    // the 'Alerts' heading and 'Manage Alerts' button appear together in the section header.
    renderWithTheme(
      <AlertReusableComponent
        entityId={entityId}
        entityName={entityName}
        onToggleAlert={onToggleAlert}
        regionId={region}
        serviceType="dbaas"
      />,
      {
        initialEntries: ['/alerts/definitions'],
        initialRoute: '/alerts/definitions',
      }
    );
    expect(screen.getByText('Alerts')).toBeVisible();
    expect(screen.getByTestId('manage-alerts')).toBeVisible();
  });

  it('Should not show Alerts heading for linode service type but still show Manage Alerts button in filter row', () => {
    // For service types in SERVICES_WITH_MANAGE_ALERTS_IN_FILTER_ROW (e.g. linode), the 'Alerts' heading
    // belongs to the service owner and is not rendered here. The Manage Alerts button moves to the filter row.
    renderWithTheme(component); // component uses serviceType='linode' with entityId

    expect(
      screen.queryByRole('heading', { level: 2, name: 'Alerts' })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('manage-alerts')).toBeVisible();
  });
  it('should show the beta chip when beta is enabled in aclpAlerting feature flag', async () => {
    const flags = {
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: true,
        new: true,
        notificationChannels: true,
        recentActivity: true,
      },
    };

    const { findByTestId, queryByTestId } = renderWithTheme(
      <AlertReusableComponent
        entityId={entityId}
        entityName={entityName}
        onToggleAlert={onToggleAlert}
        regionId={region}
        serviceType="dbaas"
      />,
      {
        flags,
      }
    );

    const betaChip = await findByTestId('betaChip');
    const newFeatureChip = queryByTestId('newFeatureChip');
    expect(betaChip).toBeVisible();
    expect(newFeatureChip).toBeNull();
  });
  it('should show the new chip when beta is disabled and new is enabled in aclpAlerting feature flag', async () => {
    const flags = {
      aclpAlerting: {
        accountAlertLimit: 10,
        accountMetricLimit: 10,
        alertDefinitions: true,
        beta: false,
        new: true,
        notificationChannels: true,
        recentActivity: true,
      },
    };

    const { findByTestId, queryByTestId } = renderWithTheme(
      <AlertReusableComponent
        entityId={entityId}
        entityName={entityName}
        onToggleAlert={onToggleAlert}
        regionId={region}
        serviceType="dbaas"
      />,
      {
        flags,
      }
    );

    const betaChip = queryByTestId('betaChip');
    const newFeatureChip = await findByTestId('newFeatureChip');
    expect(betaChip).toBeNull();
    expect(newFeatureChip).toBeVisible();
  });
});
