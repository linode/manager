import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AclpPreferenceToggle } from '.';

const expectedAclpMetricsPreferences = {
  preference: true,
  legacyModeBannerText:
    'Try the new Metrics (Beta) with more options and greater flexibility for better data analysis. You can switch back to the current view at any time.',
  betaModeBannertext:
    'Welcome to Metrics (Beta) with more options and greater flexibility for better data analysis.',
  legacyModeButtonText: 'Try the Metrics (Beta)',
  betaModeButtonText: 'Switch to legacy Metrics',
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

/**
 * ACLP Preference Toggle tests for Metrics
 */
describe('AclpMetricsPreferenceToggle', () => {
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
      expectedAclpMetricsPreferences.legacyModeBannerText
    );

    const expectedLegacyModeButtonText = screen.getByText(
      expectedAclpMetricsPreferences.legacyModeButtonText
    );
    expect(expectedLegacyModeButtonText).toBeInTheDocument();
  });

  it('should display the correct beta mode banner and button text for Metrics when isAclpMetricsBeta preference is enabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpMetricsPreferences.preference,
      isLoading: false,
    });

    renderWithTheme(<AclpPreferenceToggle type="metrics" />);

    // Check if the banner content and button text is correct in beta mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(
      expectedAclpMetricsPreferences.betaModeBannertext
    );

    const expectedLegacyModeButtonText = screen.getByText(
      expectedAclpMetricsPreferences.betaModeButtonText
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
      expectedAclpMetricsPreferences.legacyModeButtonText
    );
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpMetricsBeta: true,
    });
  });

  it('should update ACLP Metrics preference to legacy mode when toggling from beta mode', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: expectedAclpMetricsPreferences.preference,
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
      expectedAclpMetricsPreferences.betaModeButtonText
    );
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpMetricsBeta: false,
    });
  });
});
