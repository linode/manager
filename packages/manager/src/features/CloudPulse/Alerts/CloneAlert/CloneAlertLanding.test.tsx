import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CLONE_ALERT_NAME_SUFFIX } from '../constants';
import { CloneAlertLanding } from './CloneAlertLanding';

const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
  useCloneAlertDefinition: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/alerts');

  return {
    ...actual,
    useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
    useCloneAlertDefinition: queryMocks.useCloneAlertDefinition,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');

  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

const alertDetails = alertFactory.build({
  id: 1,
  label: 'CPU Usage Alert',
  service_type: 'linode',
  scope: 'entity',
});

describe('Clone Alert Landing tests', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      originalAlertId: '1',
      serviceType: 'linode',
    });

    queryMocks.useCloneAlertDefinition.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      reset: vi.fn(),
    });
  });

  it('Clone alert entities alert details error and loading path', async () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });

    const { getByText } = renderWithTheme(<CloneAlertLanding />, {
      initialRoute: '/alerts/definitions/clone/linode/1',
    });

    expect(
      getByText(
        'An error occurred while loading the alerts definitions and entities. Please try again later.'
      )
    ).toBeVisible();

    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    });

    const { getByTestId } = renderWithTheme(<CloneAlertLanding />, {
      initialRoute: '/alerts/definitions/clone/linode/1',
    });

    expect(getByTestId('circle-progress')).toBeVisible();
  });

  it('Clone alert entities alert details empty path', async () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    });

    const { getByText } = renderWithTheme(<CloneAlertLanding />, {
      initialRoute: '/alerts/definitions/clone/linode/1',
    });

    expect(getByText('No Data to display.')).toBeVisible();
  });

  it('Clone alert entities alert details happy path', async () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: alertDetails,
      isError: false,
      isLoading: false,
    });

    const { getByDisplayValue } = renderWithTheme(<CloneAlertLanding />, {
      initialRoute: '/alerts/definitions/clone/linode/1',
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
    });

    expect(
      getByDisplayValue(`${alertDetails.label}${CLONE_ALERT_NAME_SUFFIX}`)
    ).toBeVisible();
  });
});
