import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AclpPreferenceToggle } from './AclpPreferenceToggle';

import type { AclpPreferenceToggleType } from './AclpPreferenceToggle';

interface ExpectedAclpPreferenceValues {
  betaModeBannertext: string;
  betaModeButtonText: string;
  legacyModeBannerText: string;
  legacyModeButtonText: string;
  preference: boolean;
}

const expectedAclpPreferences: Record<
  AclpPreferenceToggleType['type'],
  ExpectedAclpPreferenceValues
> = {
  metrics: {
    preference: true,
    legacyModeBannerText:
      'Try the new Metrics (Beta) with more options and greater flexibility for better data analysis. You can switch back to the current Metrics view anytime.',
    betaModeBannertext:
      'Welcome to Metrics (Beta) with more options and greater flexibility for better data analysis.',
    legacyModeButtonText: 'Try the Metrics (Beta)',
    betaModeButtonText: 'Switch to legacy Metrics',
  },
  alerts: {
    preference: true,
    legacyModeBannerText:
      'Try the new Alerts (Beta) with more options for more options, including customizable alerts. You can switch back to the current view at any time.',
    betaModeBannertext:
      'Welcome to Alerts (Beta) with more options and greater flexibility.',
    legacyModeButtonText: 'Try Alerts (Beta)',
    betaModeButtonText: 'Switch to legacy Alerts',
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
   * ACLP Preference Toggle for Metrics
   */
  it('should display loading state for Metrics preference correctly', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: { aclpIntegration: true },
    });

    const skeleton = screen.getByTestId('metrics-preference-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should display the correct legacy mode banner and button text for Metrics when isAclpMetricsBeta preference is disabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: { aclpIntegration: true },
    });

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

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: { aclpIntegration: true },
    });

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

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: { aclpIntegration: true },
    });

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

    renderWithTheme(<AclpPreferenceToggle type="metrics" />, {
      flags: { aclpIntegration: true },
    });

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
   * ACLP Preference Toggle for Alerts
   */
  it('should display loading state for Alerts preference correctly', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    });

    renderWithTheme(<AclpPreferenceToggle type="alerts" />, {
      flags: { aclpIntegration: true },
    });

    const skeleton = screen.getByTestId('alerts-preference-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should display the correct legacy mode banner and button text for Alerts when isAclpAlertsBeta preference is disabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="alerts" />, {
      flags: { aclpIntegration: true },
    });

    // Check if the banner content and button text is correct in legacy mode
    const typography = screen.getByTestId('alerts-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.alerts.legacyModeBannerText
    );

    const expectedLegacyModeButtonText = screen.getByText(
      expectedAclpPreferences.alerts.legacyModeButtonText
    );
    expect(expectedLegacyModeButtonText).toBeInTheDocument();
  });

  it('should display the correct beta mode banner and button text for Alerts when isAclpAlertsBeta preference is enabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpPreferences.alerts.preference,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="alerts" />, {
      flags: { aclpIntegration: true },
    });

    // Check if the banner content and button text is correct in beta mode
    const typography = screen.getByTestId('alerts-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpPreferences.alerts.betaModeBannertext
    );

    const expectedLegacyModeButtonText = screen.getByText(
      expectedAclpPreferences.alerts.betaModeButtonText
    );
    expect(expectedLegacyModeButtonText).toBeInTheDocument();
  });

  it('should update ACLP Alerts preference to beta mode when toggling from legacy mode', async () => {
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

    renderWithTheme(<AclpPreferenceToggle type="alerts" />, {
      flags: { aclpIntegration: true },
    });

    // Click the button to switch from legacy to beta
    const button = screen.getByText(
      expectedAclpPreferences.alerts.legacyModeButtonText
    );
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpAlertsBeta: true,
    });
  });

  it('should update ACLP Alerts preference to legacy mode when toggling from beta mode', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpPreferences.alerts.preference,
      isLoading: false,
    });
    const mockUpdatePreferences = vi.fn().mockResolvedValue({
      isAclpMetricsBeta: true,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockUpdatePreferences,
    });

    renderWithTheme(<AclpPreferenceToggle type="alerts" />, {
      flags: { aclpIntegration: true },
    });

    // Click the button to switch from beta to legacy
    const button = screen.getByText(
      expectedAclpPreferences.alerts.betaModeButtonText
    );
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpAlertsBeta: false,
    });
  });
});
