import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  CLONE_ALERT_NAME_SUFFIX,
  CLONE_ALERT_SUCCESS_MESSAGE,
} from '../constants';
import { CloneAlertDefinition } from './CloneAlertDefinition';

const navigate = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useAllEntitiesByAlertIdQuery: vi.fn(),
  useCloneAlertDefinition: vi.fn(),
  useNavigate: vi.fn(() => navigate),
  useCloudPulseServiceByServiceType: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/alerts');

  return {
    ...actual,
    useAllEntitiesByAlertIdQuery: queryMocks.useAllEntitiesByAlertIdQuery,
    useCloneAlertDefinition: queryMocks.useCloneAlertDefinition,
  };
});

vi.mock('src/queries/cloudpulse/services', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');

  return {
    ...actual,
    useCloudPulseServiceByServiceType:
      queryMocks.useCloudPulseServiceByServiceType,
  };
});
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

const cloneMutateAsyncSpy = vi.fn();

const alertDetails = alertFactory.build({
  id: 1,
  label: 'CPU Usage Alert',
  description: 'Test Description',
  service_type: 'linode',
  scope: 'entity',
});

const renderComponent = () =>
  renderWithTheme(
    <CloneAlertDefinition alertDetails={alertDetails} serviceType="linode" />,
    {
      flags: {
        aclpAlerting: {
          accountAlertLimit: 10,
          accountMetricLimit: 10,
          alertDefinitions: true,
          beta: true,
          cloneAlertDefinition: true,
          notificationChannels: false,
          recentActivity: false,
        },
      },
    }
  );

beforeEach(() => {
  vi.clearAllMocks();

  Element.prototype.scrollIntoView = vi.fn();

  queryMocks.useCloneAlertDefinition.mockReturnValue({
    mutateAsync: cloneMutateAsyncSpy,
    reset: vi.fn(),
  });

  queryMocks.useAllEntitiesByAlertIdQuery.mockReturnValue({
    data: [
      {
        id: 'entity-1',
        label: 'Entity 1',
        type: 'linode',
        url: '/v4/linode/instances/entity-1',
      },
    ],
  });

  queryMocks.useCloudPulseServiceByServiceType.mockReturnValue({
    data: {
      alert: {},
    },
    isLoading: false,
    error: undefined,
  });

  cloneMutateAsyncSpy.mockResolvedValue({});
});

describe('CloneAlertDefinition', () => {
  it('should prefill cloned alert values', () => {
    renderComponent();

    expect(
      screen.getByDisplayValue(
        `${alertDetails.label}${CLONE_ALERT_NAME_SUFFIX}`
      )
    ).toBeVisible();

    expect(screen.getByDisplayValue(alertDetails.description)).toBeVisible();
  });

  it('should submit clone payload successfully', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(cloneMutateAsyncSpy).toHaveBeenCalledTimes(1);
    });

    expect(cloneMutateAsyncSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_ids: ['entity-1'],
        originalAlertId: alertDetails.id,
        serviceType: 'linode',
        label: `${alertDetails.label}${CLONE_ALERT_NAME_SUFFIX}`,
      })
    );

    await waitFor(() => {
      expect(screen.getByText(CLONE_ALERT_SUCCESS_MESSAGE)).toBeVisible();
    });
  });

  it('should show error snackbar on failed clone submission', async () => {
    cloneMutateAsyncSpy.mockRejectedValue([
      {
        reason: 'Resource error',
      },
    ]);

    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(
        screen.getByText('Cloning alert failed: Resource error')
      ).toBeVisible();
    });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('should navigate back on cancel', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigate).toHaveBeenCalledWith({
      to: '/alerts/definitions',
    });
  });
});
