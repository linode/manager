import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AclpPreferenceToggle } from './AclpPreferenceToggle';
import {
  ALERTS_BETA_MODE_BANNER_TEXT,
  ALERTS_BETA_MODE_BUTTON_TEXT,
  ALERTS_LEGACY_MODE_BANNER_TEXT,
  ALERTS_LEGACY_MODE_BUTTON_TEXT,
  METRICS_BETA_MODE_BANNER_TEXT,
  METRICS_BETA_MODE_BUTTON_TEXT,
  METRICS_LEGACY_MODE_BANNER_TEXT,
  METRICS_LEGACY_MODE_BUTTON_TEXT,
} from './constants';

import type { AclpPreferenceToggleType } from './AclpPreferenceToggle';

interface ExpectedAclpPreferenceItem {
  betaModeBannertext: string;
  betaModeButtonText: string;
  legacyModeBannerText: string;
  legacyModeButtonText: string;
  preference: boolean;
}

const expectedAclpPreferences: Record<
  AclpPreferenceToggleType['type'],
  ExpectedAclpPreferenceItem
> = {
  metrics: {
    preference: true,
    legacyModeBannerText: METRICS_LEGACY_MODE_BANNER_TEXT,
    betaModeBannertext: METRICS_BETA_MODE_BANNER_TEXT,
    legacyModeButtonText: METRICS_LEGACY_MODE_BUTTON_TEXT,
    betaModeButtonText: METRICS_BETA_MODE_BUTTON_TEXT,
  },
  alerts: {
    preference: true,
    legacyModeBannerText: ALERTS_LEGACY_MODE_BANNER_TEXT,
    betaModeBannertext: ALERTS_BETA_MODE_BANNER_TEXT,
    legacyModeButtonText: ALERTS_LEGACY_MODE_BUTTON_TEXT,
    betaModeButtonText: ALERTS_BETA_MODE_BUTTON_TEXT,
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

  it('should display the correct legacy mode banner and button text for Metrics when isAclpMetricsBeta preference is disabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />);

    // Check if the banner content and button text is correct in legacy mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.metrics.legacyModeBannerText
    );

    const expectedLegacyModeButtonText = screen.getByText(
      expectedAclpPreferences.metrics.legacyModeButtonText
    );
    expect(expectedLegacyModeButtonText).toBeInTheDocument();
  });

  it('should display the correct beta mode banner and button text for Metrics when isAclpMetricsBeta preference is enabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpPreferences.metrics.preference,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />);

    // Check if the banner content and button text is correct in beta mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.metrics.betaModeBannertext
    );

    const expectedLegacyModeButtonText = screen.getByText(
      expectedAclpPreferences.metrics.betaModeButtonText
    );
    expect(expectedLegacyModeButtonText).toBeInTheDocument();
  });

  it('should update ACLP Metrics preference to beta mode when toggling from legacy mode', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
      isLoading: false,
    });
    const mockUpdatePreferences = vi.fn().mockResolvedValue({
      isAclpMetricsBeta: false,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockUpdatePreferences,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />);

    // Click the button to switch from legacy to beta
    const button = screen.getByText(
      expectedAclpPreferences.metrics.legacyModeButtonText
    );
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpMetricsBeta: true,
    });
  });

  it('should update ACLP Metrics preference to legacy mode when toggling from beta mode', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpPreferences.metrics.preference,
      isLoading: false,
    });
    const mockUpdatePreferences = vi.fn().mockResolvedValue({
      isAclpMetricsBeta: true,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockUpdatePreferences,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />);

    // Click the button to switch from beta to legacy
    const button = screen.getByText(
      expectedAclpPreferences.metrics.betaModeButtonText
    );
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpMetricsBeta: false,
    });
  });

  /**
   * ACLP Preference Toggle tests for Alerts
   */
  it('should display the correct legacy mode banner and button text for Alerts when isAlertsBetaMode is false', () => {
    renderWithTheme(
      <AclpPreferenceToggle
        isAlertsBetaMode={false}
        onAlertsModeChange={vi.fn()}
        type="alerts"
      />
    );

    // Check if the banner content and button text is correct in legacy mode
    const typography = screen.getByTestId('alerts-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.alerts.legacyModeBannerText
    );

    const button = screen.getByText(
      expectedAclpPreferences.alerts.legacyModeButtonText
    );
    expect(button).toBeInTheDocument();
  });

  it('should display the correct beta mode banner and button text for Alerts when isAlertsBetaMode is true', () => {
    renderWithTheme(
      <AclpPreferenceToggle
        isAlertsBetaMode={true}
        onAlertsModeChange={vi.fn()}
        type="alerts"
      />
    );

    // Check if the banner content and button text is correct in beta mode
    const typography = screen.getByTestId('alerts-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.alerts.betaModeBannertext
    );

    const button = screen.getByText(
      expectedAclpPreferences.alerts.betaModeButtonText
    );
    expect(button).toBeInTheDocument();
  });

  it('should call onAlertsModeChange with true when switching from legacy to beta mode', async () => {
    const mockSetIsAclpBetaLocal = vi.fn();

    renderWithTheme(
      <AclpPreferenceToggle
        isAlertsBetaMode={false}
        onAlertsModeChange={mockSetIsAclpBetaLocal}
        type="alerts"
      />
    );

    // Click the button to switch from legacy to beta
    const button = screen.getByText(
      expectedAclpPreferences.alerts.legacyModeButtonText
    );
    await userEvent.click(button);

    expect(mockSetIsAclpBetaLocal).toHaveBeenCalledWith(true);
  });

  it('should call onAlertsModeChange with false when switching from beta to legacy mode', async () => {
    const mockSetIsAclpBetaLocal = vi.fn();

    renderWithTheme(
      <AclpPreferenceToggle
        isAlertsBetaMode={true}
        onAlertsModeChange={mockSetIsAclpBetaLocal}
        type="alerts"
      />
    );

    // Click the button to switch from beta to legacy
    const button = screen.getByText(
      expectedAclpPreferences.alerts.betaModeButtonText
    );
    await userEvent.click(button);

    expect(mockSetIsAclpBetaLocal).toHaveBeenCalledWith(false);
  });
});
