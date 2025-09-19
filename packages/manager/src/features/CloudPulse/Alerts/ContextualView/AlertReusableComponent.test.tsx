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
    renderWithTheme(component, {
      initialEntries: ['/alerts/definitions'],
      initialRoute: '/alerts/definitions',
    });
    await userEvent.click(screen.getByText('Manage Alerts'));
    expect(screen.getByText('Alerts')).toBeVisible();
  });
});
