import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AclpPreferenceToggle } from './AclpPreferenceToggle';
import {
  ALERTS_ACLP_MODE_BETA_AND_NEW_PHASE_BUTTON_TEXT,
  ALERTS_ACLP_MODE_BETA_PHASE_BANNER_TEXT,
  ALERTS_ACLP_MODE_NEW_PHASE_BANNER_TEXT,
  ALERTS_LEGACY_MODE_BETA_PHASE_BANNER_TEXT,
  ALERTS_LEGACY_MODE_BETA_PHASE_BUTTON_TEXT,
  ALERTS_LEGACY_MODE_NEW_PHASE_BANNER_TEXT,
  ALERTS_LEGACY_MODE_NEW_PHASE_BUTTON_TEXT,
  METRICS_ACLP_MODE_BETA_AND_NEW_PHASE_BUTTON_TEXT,
  METRICS_ACLP_MODE_BETA_PHASE_BANNER_TEXT,
  METRICS_ACLP_MODE_NEW_PHASE_BANNER_TEXT,
  METRICS_LEGACY_MODE_BETA_PHASE_BANNER_TEXT,
  METRICS_LEGACY_MODE_BETA_PHASE_BUTTON_TEXT,
  METRICS_LEGACY_MODE_NEW_PHASE_BANNER_TEXT,
  METRICS_LEGACY_MODE_NEW_PHASE_BUTTON_TEXT,
} from './constants';

import type { AclpPreferenceToggleType } from './AclpPreferenceToggle';

interface ExpectedAclpPreferenceItem {
  aclpModeBetaPhaseBannerText: string;
  aclpModeBetaPhaseButtonText: string;
  aclpModeNewPhaseBannerText: string;
  aclpModeNewPhaseButtonText: string;
  legacyModeBetaPhaseBannerText: string;
  legacyModeBetaPhaseButtonText: string;
  legacyModeNewPhaseBannerText: string;
  legacyModeNewPhaseButtonText: string;
  preference: boolean;
}

const expectedAclpPreferences: Record<
  AclpPreferenceToggleType['type'],
  ExpectedAclpPreferenceItem
> = {
  metrics: {
    preference: true,
    legacyModeBetaPhaseBannerText: METRICS_LEGACY_MODE_BETA_PHASE_BANNER_TEXT,
    legacyModeNewPhaseBannerText: METRICS_LEGACY_MODE_NEW_PHASE_BANNER_TEXT,
    aclpModeBetaPhaseBannerText: METRICS_ACLP_MODE_BETA_PHASE_BANNER_TEXT,
    aclpModeNewPhaseBannerText: METRICS_ACLP_MODE_NEW_PHASE_BANNER_TEXT,
    legacyModeBetaPhaseButtonText: METRICS_LEGACY_MODE_BETA_PHASE_BUTTON_TEXT,
    legacyModeNewPhaseButtonText: METRICS_LEGACY_MODE_NEW_PHASE_BUTTON_TEXT,
    aclpModeBetaPhaseButtonText:
      METRICS_ACLP_MODE_BETA_AND_NEW_PHASE_BUTTON_TEXT,
    aclpModeNewPhaseButtonText:
      METRICS_ACLP_MODE_BETA_AND_NEW_PHASE_BUTTON_TEXT,
  },
  alerts: {
    preference: true,
    legacyModeBetaPhaseBannerText: ALERTS_LEGACY_MODE_BETA_PHASE_BANNER_TEXT,
    legacyModeNewPhaseBannerText: ALERTS_LEGACY_MODE_NEW_PHASE_BANNER_TEXT,
    aclpModeBetaPhaseBannerText: ALERTS_ACLP_MODE_BETA_PHASE_BANNER_TEXT,
    legacyModeBetaPhaseButtonText: ALERTS_LEGACY_MODE_BETA_PHASE_BUTTON_TEXT,
    legacyModeNewPhaseButtonText: ALERTS_LEGACY_MODE_NEW_PHASE_BUTTON_TEXT,
    aclpModeBetaPhaseButtonText:
      ALERTS_ACLP_MODE_BETA_AND_NEW_PHASE_BUTTON_TEXT,
    aclpModeNewPhaseBannerText: ALERTS_ACLP_MODE_NEW_PHASE_BANNER_TEXT,
    aclpModeNewPhaseButtonText: ALERTS_ACLP_MODE_BETA_AND_NEW_PHASE_BUTTON_TEXT,
  },
};

const queryMocks = vi.hoisted(() => ({
  useMutatePreferences: vi.fn(),
  usePreferences: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useMutatePreferences: queryMocks.useMutatePreferences,
    usePreferences: queryMocks.usePreferences,
  };
});

describe('AclpPreferenceToggle', () => {
  const metricsFlags = {
    aclp: {
      beta: true,
      enabled: true,
      new: false,
    },
  };

  const alertingFlags = {
    aclpAlerting: {
      accountAlertLimit: 10,
      accountMetricLimit: 10,
      alertDefinitions: true,
      beta: true,
      notificationChannels: false,
      recentActivity: false,
    },
  };

  /**
   * ACLP Preference Toggle tests for Metrics
   */
  it('should display loading state for Metrics preference correctly', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />);

    const skeleton = screen.getByTestId('metrics-preference-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should display the correct legacy mode banner and button text IN BETA phase for Metrics when isAclpMetricsMode preference is disabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: metricsFlags,
    });

    // Check if the banner content and button text is correct in legacy mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.metrics.legacyModeBetaPhaseBannerText
    );

    const expectedLegacyModeButtonText = screen.getByText(
      expectedAclpPreferences.metrics.legacyModeBetaPhaseButtonText
    );
    expect(expectedLegacyModeButtonText).toBeInTheDocument();
  });

  it('should display the correct legacy mode banner and button text IN NEW phase for Metrics when isAclpMetricsMode preference is disabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: { aclp: { ...metricsFlags.aclp, beta: false, new: true } },
    });

    // Check if the banner content and button text is correct in legacy mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.metrics.legacyModeNewPhaseBannerText
    );

    const expectedLegacyModeButtonText = screen.getByText(
      expectedAclpPreferences.metrics.legacyModeNewPhaseButtonText
    );
    expect(expectedLegacyModeButtonText).toBeInTheDocument();
  });

  it('should display the correct ACLP beta phase mode banner and button text for Metrics when isAclpMetricsMode preference is enabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpPreferences.metrics.preference,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: metricsFlags,
    });

    // Check if the banner content and button text is correct in ACLP beta mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.metrics.aclpModeBetaPhaseBannerText
    );

    const expectedAclpModeBetaPhaseButtonText = screen.getByText(
      expectedAclpPreferences.metrics.aclpModeBetaPhaseButtonText
    );
    expect(expectedAclpModeBetaPhaseButtonText).toBeInTheDocument();
  });

  it('should display the correct ACLP NEW phase mode banner and button text for Metrics when isAclpMetricsMode preference is enabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpPreferences.metrics.preference,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: { aclp: { ...metricsFlags.aclp, beta: false, new: true } },
    });

    // Check if the banner content and button text is correct in ACLP new phase mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.metrics.aclpModeNewPhaseBannerText
    );

    const expectedAclpModeNewPhaseButtonText = screen.getByText(
      expectedAclpPreferences.metrics.aclpModeNewPhaseButtonText
    );
    expect(expectedAclpModeNewPhaseButtonText).toBeInTheDocument();
  });

  it('should update ACLP Metrics preference to aclp mode when toggling from legacy mode', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
      isLoading: false,
    });
    const mockUpdatePreferences = vi.fn().mockResolvedValue({
      isAclpMetricsMode: false,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockUpdatePreferences,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: metricsFlags,
    });

    // Click the button to switch from legacy to aclp
    const button = screen.getByText(
      expectedAclpPreferences.metrics.legacyModeBetaPhaseButtonText
    );
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpMetricsMode: true,
    });
  });

  it('should update ACLP Metrics preference to legacy mode when toggling from aclp mode', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpPreferences.metrics.preference,
      isLoading: false,
    });
    const mockUpdatePreferences = vi.fn().mockResolvedValue({
      isAclpMetricsMode: true,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockUpdatePreferences,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: metricsFlags,
    });

    // Click the button to switch from aclp to legacy
    const button = screen.getByText(
      expectedAclpPreferences.metrics.aclpModeBetaPhaseButtonText
    );
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpMetricsMode: false,
    });
  });

  /**
   * ACLP Preference Toggle tests for Alerts
   */
  it('should display the correct legacy mode banner and button text IN BETA phase for Alerts when isAclpAlertsMode is false', () => {
    renderWithTheme(
      <AclpPreferenceToggle
        isAclpAlertsMode={false}
        onAlertsModeChange={vi.fn()}
        type="alerts"
      />,
      { flags: alertingFlags }
    );

    // Check if the banner content and button text is correct in legacy mode
    const typography = screen.getByTestId('alerts-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.alerts.legacyModeBetaPhaseBannerText
    );

    const button = screen.getByText(
      expectedAclpPreferences.alerts.legacyModeBetaPhaseButtonText
    );
    expect(button).toBeInTheDocument();
  });

  it('should display the correct legacy mode banner and button text IN NEW phase for Alerts when isAclpAlertsMode is false', () => {
    renderWithTheme(
      <AclpPreferenceToggle
        isAclpAlertsMode={false}
        onAlertsModeChange={vi.fn()}
        type="alerts"
      />,
      {
        flags: {
          aclpAlerting: {
            ...alertingFlags.aclpAlerting,
            beta: false,
            new: true,
          },
        },
      }
    );

    // Check if the banner content and button text is correct in legacy mode
    const typography = screen.getByTestId('alerts-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.alerts.legacyModeNewPhaseBannerText
    );

    const button = screen.getByText(
      expectedAclpPreferences.alerts.legacyModeNewPhaseButtonText
    );
    expect(button).toBeInTheDocument();
  });

  it('should display the correct ACLP beta phase mode banner and button text for Alerts when isAclpAlertsMode is true', () => {
    renderWithTheme(
      <AclpPreferenceToggle
        isAclpAlertsMode={true}
        onAlertsModeChange={vi.fn()}
        type="alerts"
      />,
      { flags: alertingFlags }
    );

    // Check if the banner content and button text is correct in aclp beta mode
    const typography = screen.getByTestId('alerts-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.alerts.aclpModeBetaPhaseBannerText
    );

    const button = screen.getByText(
      expectedAclpPreferences.alerts.aclpModeBetaPhaseButtonText
    );
    expect(button).toBeInTheDocument();
  });

  it('should display the correct ACLP NEW phase mode banner and button text for Alerts when isAclpAlertsMode is true', () => {
    renderWithTheme(
      <AclpPreferenceToggle
        isAclpAlertsMode={true}
        onAlertsModeChange={vi.fn()}
        type="alerts"
      />,
      {
        flags: {
          aclpAlerting: {
            ...alertingFlags.aclpAlerting,
            beta: false,
            new: true,
          },
        },
      }
    );

    // Check if the banner content and button text is correct in aclp new mode
    const typography = screen.getByTestId('alerts-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.alerts.aclpModeNewPhaseBannerText
    );

    const button = screen.getByText(
      expectedAclpPreferences.alerts.aclpModeNewPhaseButtonText
    );
    expect(button).toBeInTheDocument();
  });

  it('should call onAlertsModeChange with true when switching from legacy to aclp mode', async () => {
    const mockSetIsAclpModeLocal = vi.fn();

    renderWithTheme(
      <AclpPreferenceToggle
        isAclpAlertsMode={false}
        onAlertsModeChange={mockSetIsAclpModeLocal}
        type="alerts"
      />,
      { flags: alertingFlags }
    );

    // Click the button to switch from legacy to aclp
    const button = screen.getByText(
      expectedAclpPreferences.alerts.legacyModeBetaPhaseButtonText
    );
    await userEvent.click(button);

    expect(mockSetIsAclpModeLocal).toHaveBeenCalledWith(true);
  });

  it('should call onAlertsModeChange with false when switching from aclp to legacy mode', async () => {
    const mockSetIsAclpModeLocal = vi.fn();

    renderWithTheme(
      <AclpPreferenceToggle
        isAclpAlertsMode={true}
        onAlertsModeChange={mockSetIsAclpModeLocal}
        type="alerts"
      />,
      { flags: alertingFlags }
    );

    // Click the button to switch from aclp to legacy
    const button = screen.getByText(
      expectedAclpPreferences.alerts.aclpModeBetaPhaseButtonText
    );
    await userEvent.click(button);

    expect(mockSetIsAclpModeLocal).toHaveBeenCalledWith(false);
  });
});
