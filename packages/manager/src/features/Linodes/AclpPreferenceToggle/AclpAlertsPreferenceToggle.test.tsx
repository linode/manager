import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AclpPreferenceToggle } from '.';

const expectedAclpAlertsPreferences = {
  preference: true,
  legacyModeBannerText:
    'Try the Alerts (Beta), featuring new options like customizable alerts. You can switch back to legacy Alerts at any time.',
  betaModeBannertext:
    'Welcome to Alerts (Beta), designed for flexibility with features like customizable alerts.',
  legacyModeButtonText: 'Try Alerts (Beta)',
  betaModeButtonText: 'Switch to legacy Alerts',
};

/**
 * ACLP Preference Toggle tests for Alerts
 */
describe('AclpAlertsPreferenceToggle', () => {
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
      expectedAclpAlertsPreferences.legacyModeBannerText
    );

    const button = screen.getByText(
      expectedAclpAlertsPreferences.legacyModeButtonText
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
      expectedAclpAlertsPreferences.betaModeBannertext
    );

    const button = screen.getByText(
      expectedAclpAlertsPreferences.betaModeButtonText
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
      expectedAclpAlertsPreferences.legacyModeButtonText
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
      expectedAclpAlertsPreferences.betaModeButtonText
    );
    await userEvent.click(button);

    expect(mockSetIsAclpBetaLocal).toHaveBeenCalledWith(false);
  });
});
