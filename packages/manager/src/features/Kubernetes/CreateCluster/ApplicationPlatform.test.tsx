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
});
