import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { getSwitchControl } from 'src/features/IAM/utilities/testHelpers';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { ActivationStatus } from './ActivationStatus';

import type { EnforcementSettingsFormValues } from './EnforcementSettings';

const defaultValues: EnforcementSettingsFormValues = {
  excludedUsers: [],
  includedUsers: [],
  isAcknowledged: false,
  ssoEnabled: false,
  ssoEnforced: false,
};

const renderComponent = (
  values: Partial<EnforcementSettingsFormValues> = {},
  isConfigInvalid = false
) =>
  renderWithThemeAndHookFormContext<EnforcementSettingsFormValues>({
    component: <ActivationStatus isConfigInvalid={isConfigInvalid} />,
    useFormOptions: { defaultValues: { ...defaultValues, ...values } },
  });

describe('ActivationStatus', () => {
  it('renders the section heading', () => {
    renderComponent();
    expect(screen.getByText('Activation Status')).toBeVisible();
  });

  it('renders both switches', () => {
    renderComponent();
    expect(screen.getByText('Enable SSO')).toBeVisible();
    expect(screen.getByText('Enforce SSO for all users')).toBeVisible();
  });

  it('renders descriptive text for each switch', () => {
    renderComponent();
    expect(screen.getByText(/Activates the IDP configuration/i)).toBeVisible();
    expect(
      screen.getByText(/Enforces SSO for all users of the account/i)
    ).toBeVisible();
  });

  it('disables the "Enable SSO" switch when SSO is disabled and config has no valid certificates', async () => {
    renderComponent({ ssoEnabled: false }, true);

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    expect(enableControl).toBeDisabled();
  });

  it('disables the "Enforce SSO" switch when SSO is not enabled', async () => {
    renderComponent({ ssoEnabled: false });

    const enforceHost = screen
      .getByText('Enforce SSO for all users')
      .closest('cds-switch') as HTMLElement;
    const enforceControl = await getSwitchControl(enforceHost);
    expect(enforceControl).toBeDisabled();
  });

  it('enables the "Enforce SSO" switch when SSO is enabled', async () => {
    renderComponent({ ssoEnabled: true });

    const enforceHost = screen
      .getByText('Enforce SSO for all users')
      .closest('cds-switch') as HTMLElement;
    const enforceControl = await getSwitchControl(enforceHost);
    expect(enforceControl).not.toBeDisabled();
  });

  it('reflects the initial ssoEnabled state as checked', async () => {
    renderComponent({ ssoEnabled: true });

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    expect(enableControl).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles SSO enabled state on click', async () => {
    renderComponent({ ssoEnabled: false });

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    await userEvent.click(enableControl as HTMLButtonElement);
    expect(enableControl).toHaveAttribute('aria-checked', 'true');
  });

  it('unchecks "Enforce SSO" when SSO is disabled while enforcement was active', async () => {
    renderComponent({ ssoEnabled: true, ssoEnforced: true });

    const enforceHost = screen
      .getByText('Enforce SSO for all users')
      .closest('cds-switch') as HTMLElement;
    const enforceControl = await getSwitchControl(enforceHost);
    expect(enforceControl).toHaveAttribute('aria-checked', 'true');

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    await userEvent.click(enableControl as HTMLButtonElement);

    expect(enforceControl).toHaveAttribute('aria-checked', 'false');
  });

  it('tooltip renders when SSO is disabled', () => {
    renderComponent({ ssoEnabled: false });
    expect(document.querySelector('cds-tooltip')).toBeInTheDocument();
  });

  it('tooltip does not render when SSO is enabled', () => {
    renderComponent({ ssoEnabled: true });
    expect(document.querySelector('cds-tooltip')).not.toBeInTheDocument();
  });

  it('tooltip disappears after enabling SSO', async () => {
    renderComponent({ ssoEnabled: false });
    expect(document.querySelector('cds-tooltip')).toBeInTheDocument();

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    await userEvent.click(enableControl as HTMLButtonElement);

    expect(document.querySelector('cds-tooltip')).not.toBeInTheDocument();
  });
});
