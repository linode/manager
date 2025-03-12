import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertReusableComponent } from './AlertReusableComponent';

const mockQuery = vi.hoisted(() => ({
  useAddEntityToAlert: vi.fn(),
  useAlertDefinitionByServiceTypeQuery: vi.fn(),
  useRemoveEntityFromAlert: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useAddEntityToAlert: mockQuery.useAddEntityToAlert,
    useAlertDefinitionByServiceTypeQuery:
      mockQuery.useAlertDefinitionByServiceTypeQuery,
    useRemoveEntityFromAlert: mockQuery.useRemoveEntityFromAlert,
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
mockQuery.useAddEntityToAlert.mockReturnValue({
  mutateAsync: vi.fn(),
});
mockQuery.useRemoveEntityFromAlert.mockReturnValue({
  mutateAsync: vi.fn(),
});

const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useHistory: vi.fn(() => mockHistory),
  };
});

describe('Alert Resuable Component for contextual view', () => {
  it('Should go to alerts definition page on clicking manage alerts button', async () => {
    const { getByTestId } = renderWithTheme(component);
    await userEvent.click(getByTestId('manage-alerts'));

    expect(mockHistory.push).toHaveBeenCalledWith(
      '/alerts/definitions'
    );
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

    const alert = alerts[alerts.length - 1];
    expect(getByText(alert.label)).toBeInTheDocument();
  });
});
