/**
 * @file Integration tests for account-level network settings.
 */

import { LinodeInterfaceAccountSetting } from '@linode/api-v4';
import { accountFactory, accountSettingsFactory } from 'src/factories';
import {
  mockGetAccount,
  mockGetAccountSettings,
  mockUpdateAccountSettings,
  mockUpdateAccountSettingsError,
} from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { randomItem } from 'support/util/random';

const interfaceTypeMap = {
  legacy_config_default_but_linode_allowed:
    'Configuration Profile Interfaces but allow Linode Interfaces',
  linode_default_but_legacy_config_allowed:
    'Linode Interfaces but allow Configuration Profile Interfaces',
  legacy_config_only: 'Configuration Profile Interfaces Only',
  linode_only: 'Linode Interfaces Only',
};

describe('Account network settings', () => {
  beforeEach(() => {
    // TODO M3-9775 - Remove `linodeInterfaces` feature flag mock when flag is removed.
    mockAppendFeatureFlags({
      linodeInterfaces: {
        enabled: true,
      },
    });
    // TODO Remove account mock when all customers have the "Linode Interfaces" capability.
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Linodes', 'Linode Interfaces', 'NodeBalancers'],
      })
    );
  });

  describe('Network interface types', () => {
    /*
     * - Confirms that customers can update their account-level Linode interface type.
     * - Confirms that "Interfaces for new Linodes" drop-down displays user's set value on page load.
     * - Confirms that save button is initially disabled, but becomes enabled upon changing the selection.
     * - Confirms that outgoing API request contains expected payload data for chosen interface type.
     */
    it('can update network interface type', () => {
      const defaultInterface = 'legacy_config_default_but_linode_allowed';
      const otherInterfaces: LinodeInterfaceAccountSetting[] = [
        'linode_default_but_legacy_config_allowed',
        'legacy_config_only',
        'linode_only',
      ];

      const mockInitialAccountSettings = accountSettingsFactory.build({
        interfaces_for_new_linodes: defaultInterface,
      });

      mockGetAccountSettings(mockInitialAccountSettings).as('getSettings');
      cy.visitWithLogin('/account/settings');

      ui.accordion
        .findByTitle('Network Interface Type')
        .should('be.visible')
        .within(() => {
          // Confirm that selected interface type matches API response, and that
          // "Save" button is disabled by default.
          cy.findByLabelText('Interfaces for new Linodes').should(
            'have.value',
            interfaceTypeMap[defaultInterface]
          );
          ui.button.findByTitle('Save').should('be.disabled');

          // Confirm that changing selection causes "Save" button to become enabled,
          // then changing back causes it to become disabled again.
          cy.findByLabelText('Interfaces for new Linodes').click();
          ui.autocompletePopper.find().within(() => {
            cy.findByText(interfaceTypeMap[otherInterfaces[0]])
              .should('be.visible')
              .click();
          });
          ui.button.findByTitle('Save').should('be.enabled');

          cy.findByLabelText('Interfaces for new Linodes').click();
          ui.autocompletePopper.find().within(() => {
            cy.findByText(interfaceTypeMap[defaultInterface])
              .should('be.visible')
              .click();
          });
          ui.button.findByTitle('Save').should('be.disabled');

          // Confirm that we can update our setting using every other choice,
          // and that the outgoing API request payload contains the expected value.
          otherInterfaces.forEach((otherInterface) => {
            cy.findByLabelText('Interfaces for new Linodes').click();
            ui.autocompletePopper.find().within(() => {
              cy.findByText(interfaceTypeMap[otherInterface])
                .should('be.visible')
                .click();
            });

            const mockUpdatedAccountSettings = {
              ...mockInitialAccountSettings,
              interfaces_for_new_linodes: otherInterface,
            };

            mockUpdateAccountSettings(mockUpdatedAccountSettings).as(
              'updateSettings'
            );
            ui.button
              .findByTitle('Save')
              .should('be.visible')
              .should('be.enabled')
              .click();

            cy.wait('@updateSettings').then((xhr) => {
              expect(xhr.request.body.interfaces_for_new_linodes).to.equal(
                otherInterface
              );
            });
          });
        });
    });

    /*
     * - Confirms that UI works as expected when `interfaces_for_new_linodes` is initially `undefined`.
     * - Confirms that UI shows ... as the default selected setting.
     * - Confirms that setting can be updated.
     */
    it('can set network interface setting for the first time', () => {
      const fallbackInterface = 'linode_default_but_legacy_config_allowed';
      const otherInterface: LinodeInterfaceAccountSetting = randomItem([
        'legacy_config_default_but_linode_allowed',
        'legacy_config_only',
        'linode_only',
      ]);

      const mockInitialAccountSettings = accountSettingsFactory.build({
        interfaces_for_new_linodes: undefined,
      });

      mockGetAccountSettings(mockInitialAccountSettings).as('getSettings');
      cy.visitWithLogin('/account/settings');

      ui.accordion
        .findByTitle('Network Interface Type')
        .should('be.visible')
        .within(() => {
          // Confirm that Linode Interfaces (with legacy configs allowed) is the default
          // interface type selection, and that the "Save" button is disabled by default.
          cy.findByLabelText('Interfaces for new Linodes').should(
            'have.value',
            interfaceTypeMap[fallbackInterface]
          );
          ui.button.findByTitle('Save').should('be.disabled');

          // Change to another option, save, and confirm outgoing request and toast.
          cy.findByLabelText('Interfaces for new Linodes')
            .should('be.visible')
            .click();
          ui.autocompletePopper.find().within(() => {
            cy.findByText(interfaceTypeMap[otherInterface])
              .should('be.visible')
              .click();
          });

          mockUpdateAccountSettings({
            ...mockInitialAccountSettings,
            interfaces_for_new_linodes: otherInterface,
          }).as('updateSettings');

          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@updateSettings').then((xhr) => {
        expect(xhr.request.body.interfaces_for_new_linodes).to.equal(
          otherInterface
        );
      });
      ui.toast.assertMessage('Network Interface type settings updated.');
    });

    /*
     * - Confirms that API error messages are displayed if the account settings update request fails.
     * - Confirms that error message is displayed for general server errors (e.g. 500s) and field-specific errors.
     */
    it('displays error message on network interface update failure', () => {
      const mockInitialAccountSettings = accountSettingsFactory.build({
        interfaces_for_new_linodes: undefined,
      });

      const errorMessage400 =
        'Must be one of legacy_config_only, legacy_config_default_but_linode_allowed, linode_only, linode_default_but_legacy_config_allowed';
      const errorMessage500 = 'An unknown error has occurred';

      mockGetAccountSettings(mockInitialAccountSettings);
      cy.visitWithLogin('/account/settings');

      ui.accordion
        .findByTitle('Network Interface Type')
        .should('be.visible')
        .within(() => {
          cy.findByLabelText('Interfaces for new Linodes')
            .should('be.visible')
            .click();
          ui.autocompletePopper.find().within(() => {
            cy.findByText(interfaceTypeMap['linode_only'])
              .should('be.visible')
              .click();
          });

          // Mock an API 500 error unrelated to user input, confirm that message is displayed.
          mockUpdateAccountSettingsError(errorMessage500, 500);
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.findByText(errorMessage500).should('be.visible');

          // Mock an API 400 error related to the interfaces field, confirm that message is displayed.
          mockUpdateAccountSettingsError({
            reason: errorMessage400,
            field: 'interfaces_for_new_linodes',
          });
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.findByText(errorMessage400).should('be.visible');
        });
    });
  });

  describe('Default Firewalls', () => {
    it('can update default firewall settings', () => {});
  });

  // TODO M3-9775: Delete this test when `linodeInterfaces` feature flag is removed.
  /*
   * - Confirms absence of "Network Interfaces Type" and "Default Firewalls" sections when feature is disabled.
   */
  it('does not display network settings when Linode Interfaces feature is disabled', () => {
    mockAppendFeatureFlags({
      linodeInterfaces: {
        enabled: false,
      },
    });

    cy.visitWithLogin('/account/settings');

    // Wait for content to load before asserting existence of networking settings.
    ui.accordionHeading.findByTitle('Close Account').should('be.visible');

    // Assert that "Network Interface Type" and "Default Firewalls" sections are absent.
    ui.accordionHeading
      .findByTitle('Network Interface Type')
      .should('not.exist');
    ui.accordionHeading.findByTitle('Default Firewalls').should('not.exist');
  });
});
