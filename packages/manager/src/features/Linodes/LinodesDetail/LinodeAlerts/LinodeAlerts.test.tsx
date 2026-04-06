import 'src/mocks/testServer';

import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import LinodeAlerts from './LinodeAlerts';

const queryMocks = vi.hoisted(() => ({
  useIsAclpSupportedRegion: vi.fn().mockReturnValue(false),
  userPermissions: vi.fn(() => ({
    data: {
      update_linode: false,
    },
  })),
  useParams: vi.fn().mockReturnValue({ linodeId: '1' }),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('src/features/CloudPulse/Utils/utils', async () => {
  const actual = await vi.importActual('src/features/CloudPulse/Utils/utils');
  return {
    ...actual,
    useIsAclpSupportedRegion: queryMocks.useIsAclpSupportedRegion,
  };
});

// Keep AlertReusableComponent lightweight in tests - it has its own test coverage.
// Renders a button so tests can simulate ACLP alert changes via onToggleAlert.
// On mount, calls onStatusChange(true) and onToggleAlert({}) to simulate the real
// component's initialization: reporting ready and sending the initial server state.
vi.mock(
  'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent',
  () => ({
    AlertReusableComponent: ({
      onStatusChange,
      onToggleAlert,
    }: {
      onStatusChange?: (isReady: boolean) => void;
      onToggleAlert: (payload: unknown) => void;
    }) => {
      React.useEffect(() => {
        onStatusChange?.(true);
        onToggleAlert({});
      }, []);

      return (
        <div data-testid="aclp-alerts">
          <button
            data-testid="aclp-toggle"
            onClick={() => onToggleAlert({ system_alerts: [1] })}
          >
            Toggle ACLP Alert
          </button>
        </div>
      );
    },
  })
);

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeAlerts — standalone mode (ACLP flag OFF)', () => {
  it('renders the alerts fields', async () => {
    const { getByText } = renderWithTheme(<LinodeAlerts />);

    expect(getByText('Alerts')).toBeVisible();
    expect(getByText('CPU Usage')).toBeVisible();
    expect(getByText('Outbound Traffic')).toBeVisible();
    expect(getByText('Transfer Quota')).toBeVisible();
  });

  it('should disable "Save" button if the user does not have update_linode permission', async () => {
    const { getByTestId } = renderWithTheme(<LinodeAlerts />);

    const saveBtn = getByTestId('alerts-save');
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Save" button if the user has update_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { update_linode: true },
    });
    const { getByTestId, getAllByTestId } = renderWithTheme(<LinodeAlerts />);

    const inputCPU = getAllByTestId('textfield-input')[0];
    expect(inputCPU).toBeInTheDocument();

    const saveBtn = getByTestId('alerts-save');
    expect(saveBtn).toBeInTheDocument();

    await waitFor(async () => {
      await userEvent.type(inputCPU, '20');
      expect(saveBtn).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});

describe('LinodeAlerts — unified mode (aclpServices.linode.alerts.enabled + region supported)', () => {
  const flags = {
    aclpServices: {
      linode: {
        alerts: {
          enabled: true,
          beta: false, // "beta" here is irrelevant since we are no longer using this service-specific beta flag
        },
      },
    },
    aclpAlerting: {
      accountAlertLimit: 10,
      accountMetricLimit: 10,
      alertDefinitions: false,
      beta: true, // relevant for this test suite
      notificationChannels: false,
      recentActivity: false,
      new: false, // relevant for this test suite
    },
  };

  beforeEach(() => {
    queryMocks.useIsAclpSupportedRegion.mockReturnValue(true); // ACLP supported region
    queryMocks.userPermissions.mockReturnValue({
      data: { update_linode: false },
    });
  });

  afterEach(() => {
    queryMocks.useIsAclpSupportedRegion.mockReturnValue(false);
  });

  it('renders both the Legacy Alerts and Alerts accordions', async () => {
    const { getByText } = renderWithTheme(<LinodeAlerts />, { flags });

    expect(getByText('Legacy Alerts')).toBeVisible();
    expect(getByText('Alerts')).toBeVisible();
  });

  it('renders the ACLP alerts component inside the Alerts accordion', async () => {
    const { getByTestId } = renderWithTheme(<LinodeAlerts />, { flags });

    expect(getByTestId('aclp-alerts')).toBeVisible();
  });

  it('renders the unified Save Alerts button instead of the standalone Save button', async () => {
    const { getByTestId, queryByTestId } = renderWithTheme(<LinodeAlerts />, {
      flags,
    });

    expect(getByTestId('unified-alerts-save')).toBeVisible();
    expect(queryByTestId('alerts-save')).not.toBeInTheDocument();
  });

  it('disables the unified Save button when there are no unsaved changes', async () => {
    const { getByTestId } = renderWithTheme(<LinodeAlerts />, { flags });

    expect(getByTestId('unified-alerts-save')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('enables the unified Save button after editing a legacy alert field', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { update_linode: true },
    });
    const { getByTestId, getAllByTestId } = renderWithTheme(<LinodeAlerts />, {
      flags,
    });

    const inputCPU = getAllByTestId('textfield-input')[0];
    const saveBtn = getByTestId('unified-alerts-save');

    await waitFor(async () => {
      await userEvent.type(inputCPU, '20');
      expect(saveBtn).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('enables the unified Save button when there are unsaved ACLP alert changes', async () => {
    const { getByTestId } = renderWithTheme(<LinodeAlerts />, { flags });

    const saveBtn = getByTestId('unified-alerts-save');
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');

    // Simulate the user toggling an alert away from the initial state.
    await userEvent.click(getByTestId('aclp-toggle'));

    await waitFor(() => {
      expect(saveBtn).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('displays the correct info banner about the ACLP Alerts feature in BETA Phase', async () => {
    const { getByTestId } = renderWithTheme(<LinodeAlerts />, { flags });

    expect(getByTestId('notice-info')).toHaveTextContent(
      'Try the Alerts (Beta), featuring new options like customizable alerts. You can keep your legacy alerts and add them to the new Beta Alerts.'
    );
  });

  it('displays the correct info banner about the ACLP Alerts feature in NEW Phase', async () => {
    const { getByTestId } = renderWithTheme(<LinodeAlerts />, {
      flags: {
        aclpServices: flags.aclpServices,
        aclpAlerting: { ...flags.aclpAlerting, beta: false, new: true },
      },
    });

    expect(getByTestId('notice-info')).toHaveTextContent(
      'Try Alerts (New) with features like customizable alerts. Legacy and new alerts can be used together.'
    );
  });
});
