import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AclpMetricsPreferenceToggle } from './AclpMetricsPreferenceToggle';

import type { ManagerPreferences } from '@linode/utilities';

const preference: ManagerPreferences['isAclpMetricsBeta'] = true;
const legacyModeBannerText =
  'Try the new Metrics (Beta) with more options and greater flexibility for better data analysis. You can switch back to the current Metrics view anytime.';
const betaModeBannertext =
  'Welcome to Metrics (Beta) with more options and greater flexibility for better data analysis.';
const legacyModeButtonText = 'Try the Metrics (Beta)';
const betaModeButtonText = 'Switch to legacy Metrics';

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

describe('AclpMetricsPreferenceToggle', () => {
  it('should display loading state correctly', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    });

    renderWithTheme(<AclpMetricsPreferenceToggle />, {
      flags: { aclpIntegration: true },
    });

    const skeleton = screen.getByTestId('metrics-preference-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should display banner and button with the correct text in Legacy mode when isAclpMetricsBeta preference is disabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: false,
      isLoading: false,
    });

    renderWithTheme(<AclpMetricsPreferenceToggle />, {
      flags: { aclpIntegration: true },
    });

    // Check if the banner content and button text is correct in Legacy mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(legacyModeBannerText);

    const expectedLegacyModeButtonText = screen.getByText(legacyModeButtonText);
    expect(expectedLegacyModeButtonText).toBeInTheDocument();
  });

  it('should display banner and button with the correct text in Beta mode when isAclpMetricsBeta preference is enabled', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
      isLoading: false,
    });

    renderWithTheme(<AclpMetricsPreferenceToggle />, {
      flags: { aclpIntegration: true },
    });

    // Check if the banner content and button text is correct in Beta mode
    const typography = screen.getByTestId('metrics-preference-banner-text');
    expect(typography).toHaveTextContent(betaModeBannertext);

    const expectedLegacyModeButtonText = screen.getByText(betaModeButtonText);
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

    renderWithTheme(<AclpMetricsPreferenceToggle />, {
      flags: { aclpIntegration: true },
    });

    // Click the button to switch from legacy to beta
    const button = screen.getByText(legacyModeButtonText);
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpMetricsBeta: true,
    });
  });

  it('should update ACLP Metrics preference to legacy mode when toggling from beta mode', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
      isLoading: false,
    });
    const mockUpdatePreferences = vi.fn().mockResolvedValue({
      isAclpMetricsBeta: true,
    });
    queryMocks.useMutatePreferences.mockReturnValue({
      mutateAsync: mockUpdatePreferences,
    });

    renderWithTheme(<AclpMetricsPreferenceToggle />, {
      flags: { aclpIntegration: true },
    });

    // Click the button to switch from beta to legacy
    const button = screen.getByText(betaModeButtonText);
    await userEvent.click(button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      isAclpMetricsBeta: false,
    });
  });
});
