import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AclpPreferenceToggle } from './AclpPreferenceToggle';

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
    legacyModeBannerText:
      'Try the new Metrics (Beta) with more options and greater flexibility for better data analysis. You can switch back to the current view at any time.',
    betaModeBannertext:
      'Welcome to Metrics (Beta) with more options and greater flexibility for better data analysis.',
    legacyModeButtonText: 'Try the Metrics (Beta)',
    betaModeButtonText: 'Switch to legacy Metrics',
  },
  alerts: {
    preference: true,
    legacyModeBannerText:
      'Try the Alerts (Beta), featuring new options like customizable alerts. You can switch back to legacy Alerts at any time.',
    betaModeBannertext:
      'Welcome to Alerts (Beta), designed for flexibility with features like customizable alerts.',
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
  it('should display the correct legacy mode banner and button text for Alerts when isAclpAlertsBetaLocal is false', () => {
    renderWithTheme(
      <AclpPreferenceToggle
        handleIsAclpAlertsBetaLocal={vi.fn()}
        isAclpAlertsBetaLocal={false}
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

  it('should display the correct beta mode banner and button text for Alerts when isAclpAlertsBetaLocal is true', () => {
    renderWithTheme(
      <AclpPreferenceToggle
        handleIsAclpAlertsBetaLocal={vi.fn()}
        isAclpAlertsBetaLocal={true}
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

  it('should call handleIsAclpAlertsBetaLocal with true when switching from legacy to beta mode', async () => {
    const mockSetIsAclpBetaLocal = vi.fn();

    renderWithTheme(
      <AclpPreferenceToggle
        handleIsAclpAlertsBetaLocal={mockSetIsAclpBetaLocal}
        isAclpAlertsBetaLocal={false}
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

  it('should call handleIsAclpAlertsBetaLocal with false when switching from beta to legacy mode', async () => {
    const mockSetIsAclpBetaLocal = vi.fn();

    renderWithTheme(
      <AclpPreferenceToggle
        handleIsAclpAlertsBetaLocal={mockSetIsAclpBetaLocal}
        isAclpAlertsBetaLocal={true}
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
