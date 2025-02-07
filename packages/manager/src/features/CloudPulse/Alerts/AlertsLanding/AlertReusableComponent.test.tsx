import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertReusableComponent } from './AlertsReusableComponent';

const mockQuery = vi.hoisted(() => ({
  useAlertDefinitionByServiceTypeQuery: vi.fn(),
  useUpdateEntityToAlert: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useAlertDefinitionByServiceTypeQuery:
      mockQuery.useAlertDefinitionByServiceTypeQuery,
    useUpdateEntityToAlert: mockQuery.useUpdateEntityToAlert,
  };
});
const serviceType = 'linode';
const entityId = '123';
const entityName = 'test-instance';
const alerts = [
  ...alertFactory.buildList(3, { service_type: serviceType }),
  ...alertFactory.buildList(7, {
    entity_ids: [entityId],
    service_type: serviceType,
  }),
  ...alertFactory.buildList(1, {
    entity_ids: [entityId],
    service_type: serviceType,
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
    serviceType={serviceType}
  />
);

mockQuery.useAlertDefinitionByServiceTypeQuery.mockReturnValue(mockReturnValue);
mockQuery.useUpdateEntityToAlert.mockReturnValue({
  mutateAsync: () => {},
});

describe('Alert Resuable Component for contextual view', () => {
  it('Should go to alerts definition page on clicking manage alerts button', async () => {
    const history = createMemoryHistory();
    const { getByTestId } = renderWithTheme(
      <Router history={history}>{component}</Router>
    );
    await userEvent.click(getByTestId('manage-alerts'));

    expect(history.location.pathname).toBe('/monitor/alerts/definitions');
  });

  it('Should filter alerts based on search text', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithTheme(
      component
    );
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

    const alert =
      alerts.find((alert) => alert.type === 'system') ??
      alerts[alerts.length - 1];
    expect(getByText(alert.label)).toBeInTheDocument();
  });
});
