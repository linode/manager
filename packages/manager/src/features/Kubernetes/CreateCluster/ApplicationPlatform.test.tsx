import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ApplicationPlatform } from './ApplicationPlatform';

const MockDefaultProps = {
  isSectionDisabled: false,
  setAPL: vi.fn(),
  setHighAvailability: vi.fn(),
};

describe('ApplicationPlatform', () => {
  it('renders enabled but unchecked radio buttons with the section enabled', () => {
    const { getByRole } = renderWithTheme(
      <ApplicationPlatform {...MockDefaultProps} />
    );
    const yesRadio = getByRole('radio', { name: /yes/i });
    const noRadio = getByRole('radio', { name: /no/i });

    expect(yesRadio).toBeEnabled();
    expect(yesRadio).not.toBeChecked();
    expect(noRadio).toBeEnabled();
    expect(noRadio).not.toBeChecked();
  });

  it('toggles checked state correctly with the section enabled', async () => {
    const { getByRole } = renderWithTheme(
      <ApplicationPlatform {...MockDefaultProps} />
    );
    const yesRadio = getByRole('radio', { name: /yes/i });
    const noRadio = getByRole('radio', { name: /no/i });

    // Confirm both buttons can be clicked.
    await userEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();

    await userEvent.click(noRadio);
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });

  it('renders disabled radio buttons and the "no" option checked with the section disabled', () => {
    const { getByRole } = renderWithTheme(
      <ApplicationPlatform {...MockDefaultProps} isSectionDisabled />
    );
    const yesRadio = getByRole('radio', { name: /yes/i });
    const noRadio = getByRole('radio', { name: /no/i });

    expect(yesRadio).toBeDisabled();
    expect(yesRadio).not.toBeChecked();
    expect(noRadio).toBeDisabled();
    expect(noRadio).toBeChecked();
  });

  it('calls setHighAvailability when APL is enabled for standard tier', async () => {
    const mockSetHighAvailability = vi.fn();
    const { getByRole } = renderWithTheme(
      <ApplicationPlatform
        {...MockDefaultProps}
        setHighAvailability={mockSetHighAvailability}
      />
    );
    const yesRadio = getByRole('radio', { name: /yes/i });

    await userEvent.click(yesRadio);

    expect(mockSetHighAvailability).toHaveBeenCalledWith(true);
  });

  it('does not call setHighAvailability when APL is enabled for enterprise tier', async () => {
    const mockSetHighAvailability = vi.fn();
    const { getByRole } = renderWithTheme(
      <ApplicationPlatform
        {...MockDefaultProps}
        isEnterpriseTier={true}
        setHighAvailability={mockSetHighAvailability}
      />
    );
    const yesRadio = getByRole('radio', { name: /yes/i });

    await userEvent.click(yesRadio);

    expect(mockSetHighAvailability).not.toHaveBeenCalled();
  });

  it('calls setHighAvailability with false when APL is disabled for standard tier', async () => {
    const mockSetHighAvailability = vi.fn();
    const { getByRole } = renderWithTheme(
      <ApplicationPlatform
        {...MockDefaultProps}
        setHighAvailability={mockSetHighAvailability}
      />
    );
    const noRadio = getByRole('radio', { name: /no/i });

    await userEvent.click(noRadio);

    expect(mockSetHighAvailability).toHaveBeenCalledWith(false);
  });

  it('does not call setHighAvailability when APL is disabled for enterprise tier', async () => {
    const mockSetHighAvailability = vi.fn();
    const { getByRole } = renderWithTheme(
      <ApplicationPlatform
        {...MockDefaultProps}
        isEnterpriseTier={true}
        setHighAvailability={mockSetHighAvailability}
      />
    );
    const noRadio = getByRole('radio', { name: /no/i });

    await userEvent.click(noRadio);

    expect(mockSetHighAvailability).not.toHaveBeenCalled();
  });

  describe('APL and HA Control Plane Integration - Tier Switching Scenarios', () => {
    it('maintains correct HA behavior when switching from enterprise to standard context', async () => {
      const mockSetHighAvailability = vi.fn();
      const mockSetAPL = vi.fn();

      // Simulate starting with APL enabled in enterprise tier context
      const { rerender, getByRole } = renderWithTheme(
        <ApplicationPlatform
          {...MockDefaultProps}
          isEnterpriseTier={true}
          setAPL={mockSetAPL}
          setHighAvailability={mockSetHighAvailability}
        />
      );

      // Enable APL in enterprise context
      const yesRadio = getByRole('radio', { name: /yes/i });
      await userEvent.click(yesRadio);

      expect(mockSetAPL).toHaveBeenCalledWith(true);
      expect(mockSetHighAvailability).not.toHaveBeenCalled(); // Enterprise doesn't call HA

      // Reset mocks
      mockSetAPL.mockClear();
      mockSetHighAvailability.mockClear();

      // Simulate switching to standard tier context (APL remains enabled)
      rerender(
        <ApplicationPlatform
          {...MockDefaultProps}
          isEnterpriseTier={false}
          setAPL={mockSetAPL}
          setHighAvailability={mockSetHighAvailability}
        />
      );

      // APL should still be enabled and now should affect HA
      const yesRadioStandard = getByRole('radio', { name: /yes/i });
      await userEvent.click(yesRadioStandard);

      expect(mockSetAPL).toHaveBeenCalledWith(true);
      expect(mockSetHighAvailability).toHaveBeenCalledWith(true); // Standard tier enables HA when APL is enabled
    });

    it('handles APL state correctly when switching tier contexts with APL disabled', async () => {
      const mockSetHighAvailability = vi.fn();
      const mockSetAPL = vi.fn();

      // Start with standard tier context, APL disabled
      const { rerender, getByRole } = renderWithTheme(
        <ApplicationPlatform
          {...MockDefaultProps}
          isEnterpriseTier={false}
          setAPL={mockSetAPL}
          setHighAvailability={mockSetHighAvailability}
        />
      );

      const noRadio = getByRole('radio', { name: /no/i });
      await userEvent.click(noRadio);

      expect(mockSetAPL).toHaveBeenCalledWith(false);
      expect(mockSetHighAvailability).toHaveBeenCalledWith(false);

      // Reset mocks
      mockSetAPL.mockClear();
      mockSetHighAvailability.mockClear();

      // Switch to enterprise tier context (APL remains disabled)
      rerender(
        <ApplicationPlatform
          {...MockDefaultProps}
          isEnterpriseTier={true}
          setAPL={mockSetAPL}
          setHighAvailability={mockSetHighAvailability}
        />
      );

      // APL disabled should not affect HA in enterprise context
      const noRadioEnterprise = getByRole('radio', { name: /no/i });
      await userEvent.click(noRadioEnterprise);

      expect(mockSetAPL).toHaveBeenCalledWith(false);
      expect(mockSetHighAvailability).not.toHaveBeenCalled(); // Enterprise doesn't manage HA through APL
    });
  });
});
