import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { InterfaceGeneration } from './InterfaceGeneration';

import type { Region } from '@linode/api-v4';

const getAccountSettingsAPI = '*/v4*/account/settings';

describe('InterfaceGeneration', () => {
  it('disables the radios if the account setting enforces linode_only interfaces', async () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'linode_only',
    });

    server.use(
      http.get(getAccountSettingsAPI, () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { getAllByRole, findByRole } = renderWithThemeAndHookFormContext({
      component: <InterfaceGeneration />,
    });

    // Wait for the tooltip icon to appear (indicating the disabled state)
    await findByRole('button', {
      name: 'Your account administrator has enforced that all new Linodes are created with Linode interfaces.',
    });

    // Verify both radio buttons are disabled
    const radios = getAllByRole('radio');
    expect(radios).toHaveLength(2);

    for (const radio of radios) {
      expect(radio).toBeDisabled();
    }
  });

  it('disables the radios if the account setting enforces legacy config interfaces', async () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'legacy_config_only',
    });

    server.use(
      http.get(getAccountSettingsAPI, () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { getAllByRole, findByRole } = renderWithThemeAndHookFormContext({
      component: <InterfaceGeneration />,
    });

    // Wait for the tooltip icon to appear (indicating the disabled state)
    await findByRole('button', {
      name: 'Your account administrator has enforced that all new Linodes are created with legacy configuration interfaces.',
    });

    // Verify both radio buttons are disabled
    const radios = getAllByRole('radio');
    expect(radios).toHaveLength(2);

    for (const radio of radios) {
      expect(radio).toBeDisabled();
    }
  });

  it('enables the radios when account settings allow both interface types', async () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'linode_default_but_legacy_config_allowed',
    });

    server.use(
      http.get(getAccountSettingsAPI, () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { getAllByRole, queryByRole } = renderWithThemeAndHookFormContext({
      component: <InterfaceGeneration />,
    });

    // Wait for radios to render
    await waitFor(() => {
      // Verify no disabled tooltip appears
      expect(
        queryByRole('button', {
          name: /Your account administrator has enforced/,
        })
      ).toBeNull();
    });

    // Verify both radio buttons are enabled
    const radios = getAllByRole('radio');
    expect(radios).toHaveLength(2);

    for (const radio of radios) {
      expect(radio).toBeEnabled();
    }
  });

  it('defaults to linode interface when value is not set', async () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'linode_default_but_legacy_config_allowed',
    });

    server.use(
      http.get(getAccountSettingsAPI, () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { getByDisplayValue } = renderWithThemeAndHookFormContext({
      component: <InterfaceGeneration />,
      useFormOptions: {
        defaultValues: {
          interface_generation: null,
        },
      },
    });

    // Wait for component to render
    await waitFor(() => {
      // Verify linode radio is selected by default
      expect(getByDisplayValue('linode')).toBeChecked();
    });
  });

  it('allows user to select legacy config interface when enabled', async () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'legacy_config_default_but_linode_allowed',
    });

    server.use(
      http.get(getAccountSettingsAPI, () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { getByDisplayValue } = renderWithThemeAndHookFormContext({
      component: <InterfaceGeneration />,
      useFormOptions: {
        defaultValues: {
          interface_generation: 'linode',
        },
      },
    });

    const legacyConfigRadio = getByDisplayValue('legacy_config');

    // Click on legacy config radio
    await userEvent.click(legacyConfigRadio);

    // Verify legacy config is now selected
    expect(legacyConfigRadio).toBeChecked();
    expect(getByDisplayValue('linode')).not.toBeChecked();
  });

  describe('region capability', () => {
    const setup = (region: Region) => {
      server.use(
        http.get(getAccountSettingsAPI, () =>
          HttpResponse.json(
            accountSettingsFactory.build({
              interfaces_for_new_linodes:
                'linode_default_but_legacy_config_allowed',
            })
          )
        ),
        http.get(`*/v4*/regions/${region.id}`, () => HttpResponse.json(region))
      );
      return renderWithThemeAndHookFormContext({
        component: <InterfaceGeneration />,
        useFormOptions: {
          defaultValues: {
            interface_generation: 'linode',
            region: region.id,
          },
        },
      });
    };

    it('disables the Linode Interfaces radio and shows the availability notice when the selected region lacks the Linode Interfaces capability', async () => {
      const { findByText, getByDisplayValue } = setup(
        regionFactory.build({ capabilities: ['Linodes'] })
      );

      await findByText(
        /Linode Interfaces are not available in the selected region/i
      );
      expect(getByDisplayValue('linode')).toBeDisabled();
      expect(getByDisplayValue('legacy_config')).toBeEnabled();
    });

    it('keeps the Linode Interfaces radio enabled when the selected region has the Linode Interfaces capability', async () => {
      const { getByDisplayValue, queryByText } = setup(
        regionFactory.build({ capabilities: ['Linode Interfaces'] })
      );

      await waitFor(() => expect(getByDisplayValue('linode')).toBeEnabled());
      expect(getByDisplayValue('legacy_config')).toBeEnabled();
      expect(
        queryByText(
          /Linode Interfaces are not available in the selected region/i
        )
      ).toBeNull();
    });
  });

  it('displays correct labels for both interface types', () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'linode_default_but_legacy_config_allowed',
    });

    server.use(
      http.get(getAccountSettingsAPI, () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { getByText } = renderWithThemeAndHookFormContext({
      component: <InterfaceGeneration />,
    });

    // Verify interface type labels
    expect(getByText('Linode Interfaces (Recommended)')).toBeVisible();
    expect(
      getByText('Configuration Profile Interfaces (Legacy)')
    ).toBeVisible();
    expect(getByText('Network Interface Type')).toBeVisible();
  });
});
