import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { InterfaceGeneration } from './InterfaceGeneration';

describe('InterfaceGeneration', () => {
  it('disables the radios if the account setting enforces linode_only interfaces', async () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'linode_only',
    });

    server.use(
      http.get('*/v4/account/settings', () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { findByText, getAllByRole, getByText } =
      renderWithThemeAndHookFormContext({
        component: <InterfaceGeneration />,
      });

    const button = getByText('Network Interface Type');

    // Expand the "Show More"
    await userEvent.click(button);

    // Hover to check for the tooltip
    await userEvent.hover(getByText('Network Interface Type'));

    await findByText(
      'You account administrator has enforced that all new Linodes are created with Linode interfaces.'
    );

    for (const radio of getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });

  it('disables the radios if the account setting enforces legacy config interfaces', async () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'legacy_config_only',
    });

    server.use(
      http.get('*/v4/account/settings', () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { findByText, getAllByRole, getByText } =
      renderWithThemeAndHookFormContext({
        component: <InterfaceGeneration />,
      });

    const button = getByText('Network Interface Type');

    // Expand the "Show More"
    await userEvent.click(button);

    // Hover to check for the tooltip
    await userEvent.hover(getByText('Network Interface Type'));

    await findByText(
      'You account administrator has enforced that all new Linodes are created with legacy configuration interfaces.'
    );

    const radios = getAllByRole('radio');

    expect(radios).toHaveLength(2);

    for (const radio of radios) {
      expect(radio).toBeDisabled();
    }
  });
});
