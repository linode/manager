/**
 * @file Integration tests for account-level network settings.
 */

import { LinodeInterfaceAccountSetting } from '@linode/api-v4';
import {
  accountFactory,
  accountSettingsFactory,
  firewallFactory,
  firewallSettingsFactory,
} from 'src/factories';
import {
  mockGetAccount,
  mockGetAccountSettings,
  mockUpdateAccountSettings,
  mockUpdateAccountSettingsError,
} from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetFirewalls,
  mockGetFirewallSettings,
  mockUpdateFirewallSettings,
  mockUpdateFirewallSettingsError,
} from 'support/intercepts/firewalls';
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
     * - Confirms that UI works as expected when `interfaces_for_new_linodes` is initially `undefined`.
     * - Confirms that UI shows 'Linode Interfaces but allow Configuration Profile Interfaces' as the default selected setting.
     * - Confirms that setting can be updated when `interfaces_for_new_linodes` is initially unset.
     * - Confirms that toast appears upon successful settings update operation.
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
    /*
     * - Confirms that users can set their default firewalls for the first time.
     * - Confirms that each entity/interface type can have a different firewall set.
     * - Confirms that outgoing request payload contains the expected data.
     * - Confirms that toast notification appears upon successful update.
     */
    it('can set default firewall settings for the first time', () => {
      const initialFirewallSettings = firewallSettingsFactory.build({
        default_firewall_ids: {
          linode: null,
          nodebalancer: null,
          public_interface: null,
          vpc_interface: null,
        },
      });

      const mockFirewalls = firewallFactory.buildList(4);
      mockGetFirewalls(mockFirewalls);
      mockGetFirewallSettings(initialFirewallSettings);
      mockUpdateFirewallSettings({
        default_firewall_ids: {
          linode: mockFirewalls[0].id,
          public_interface: mockFirewalls[1].id,
          vpc_interface: mockFirewalls[2].id,
          nodebalancer: mockFirewalls[3].id,
        },
      }).as('updateSettings');

      cy.visitWithLogin('/account/settings');

      ui.accordion
        .findByTitle('Default Firewalls')
        .should('be.visible')
        .within(() => {
          // Confirm that "Save" button is disabled until changes are made.
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.disabled');

          // Confirm that none of the default firewall fields have a value set.
          [
            'Configuration Profile Interfaces Firewall',
            'Linode Interfaces - Public Interface Firewall',
            'Linode Interfaces - VPC Interface Firewall',
            'NodeBalancers Firewall',
          ].forEach((interfaceTypeField) => {
            cy.findByLabelText(interfaceTypeField).should(
              'have.attr',
              'value',
              ''
            );
          });

          // Set each interface type to a different default firewall.
          // Confirm that "Save" button becomes enabled upon making first selection.
          cy.findByLabelText(
            'Configuration Profile Interfaces Firewall'
          ).click();
          ui.autocompletePopper
            .findByTitle(mockFirewalls[0].label)
            .should('be.visible')
            .click();

          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled');

          cy.findByLabelText(
            'Linode Interfaces - Public Interface Firewall'
          ).click();
          ui.autocompletePopper
            .findByTitle(mockFirewalls[1].label)
            .should('be.visible')
            .click();

          cy.findByLabelText(
            'Linode Interfaces - VPC Interface Firewall'
          ).click();
          ui.autocompletePopper
            .findByTitle(mockFirewalls[2].label)
            .should('be.visible')
            .click();

          cy.findByLabelText('NodeBalancers Firewall').click();
          ui.autocompletePopper
            .findByTitle(mockFirewalls[3].label)
            .should('be.visible')
            .click();

          // Click the "Save" button and confirm outgoing request payload
          // contains the expected data.
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@updateSettings').then((xhr) => {
        expect(xhr.request.body.default_firewall_ids.linode).to.equal(
          mockFirewalls[0].id
        );
        expect(xhr.request.body.default_firewall_ids.public_interface).to.equal(
          mockFirewalls[1].id
        );
        expect(xhr.request.body.default_firewall_ids.vpc_interface).to.equal(
          mockFirewalls[2].id
        );
        expect(xhr.request.body.default_firewall_ids.nodebalancer).to.equal(
          mockFirewalls[3].id
        );
      });

      ui.toast.assertMessage('Default firewall settings updated.');
    });

    /*
     * - Confirms that users can update their default firewall settings.
     * - Confirms that outgoing request payload contains expected data.
     */
    it('can update default firewall settings', () => {
      const mockFirewallInitial = firewallFactory.build();
      const mockFirewallUpdated = firewallFactory.build();

      const initialFirewallSettings = firewallSettingsFactory.build({
        default_firewall_ids: {
          linode: mockFirewallInitial.id,
          nodebalancer: mockFirewallInitial.id,
          public_interface: mockFirewallInitial.id,
          vpc_interface: mockFirewallInitial.id,
        },
      });

      const updatedFirewallSettings = firewallSettingsFactory.build({
        default_firewall_ids: {
          linode: mockFirewallUpdated.id,
          nodebalancer: mockFirewallUpdated.id,
          public_interface: mockFirewallUpdated.id,
          vpc_interface: mockFirewallUpdated.id,
        },
      });

      mockGetFirewalls([mockFirewallInitial, mockFirewallUpdated]);
      mockGetFirewallSettings(initialFirewallSettings);
      mockUpdateFirewallSettings(updatedFirewallSettings).as('updateSettings');

      cy.visitWithLogin('/account/settings');

      ui.accordion
        .findByTitle('Default Firewalls')
        .should('be.visible')
        .within(() => {
          // Confirm that "Save" button is disabled before making changes.
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.disabled');

          // Update each default firewall.
          [
            'Configuration Profile Interfaces Firewall',
            'Linode Interfaces - Public Interface Firewall',
            'Linode Interfaces - VPC Interface Firewall',
            'NodeBalancers Firewall',
          ].forEach((interfaceTypeField) => {
            cy.findByLabelText(interfaceTypeField)
              .should('be.visible')
              .should('have.attr', 'value', mockFirewallInitial.label)
              .click();

            ui.autocompletePopper
              .findByTitle(mockFirewallUpdated.label)
              .should('be.visible')
              .click();
          });

          // Click "Save" and confirm outgoing API request contains expected payload data.
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@updateSettings').then((xhr) => {
        expect(xhr.request.body.default_firewall_ids.linode).to.equal(
          mockFirewallUpdated.id
        );
        expect(xhr.request.body.default_firewall_ids.nodebalancer).to.equal(
          mockFirewallUpdated.id
        );
        expect(xhr.request.body.default_firewall_ids.public_interface).to.equal(
          mockFirewallUpdated.id
        );
        expect(xhr.request.body.default_firewall_ids.vpc_interface).to.equal(
          mockFirewallUpdated.id
        );
      });

      ui.toast.assertMessage('Default firewall settings updated.');
    });

    /*
     * - Confirms that API error messages are displayed if the account default firewall update request fails.
     * - Confirms that error message is displayed for general server errors (e.g. 500s) and field-specific errors.
     */
    it('displays error message on default firewall update failure', () => {
      const initialFirewallSettings = firewallSettingsFactory.build({
        default_firewall_ids: {
          linode: null,
          nodebalancer: null,
          public_interface: null,
          vpc_interface: null,
        },
      });

      const mockFirewall = firewallFactory.build();

      mockGetFirewallSettings(initialFirewallSettings);
      mockGetFirewalls([mockFirewall]);

      cy.visitWithLogin('/account/settings');

      ui.accordion
        .findByTitle('Default Firewalls')
        .should('be.visible')
        .within(() => {
          cy.findByLabelText(
            'Configuration Profile Interfaces Firewall'
          ).click();
          ui.autocompletePopper
            .findByTitle(mockFirewall.label)
            .should('be.visible')
            .click();

          // Confirm that server errors (5xx responses, etc.) get displayed
          mockUpdateFirewallSettingsError('An unknown error has occurred', 500);
          ui.button
            .findByTitle('Save')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.findByText('An unknown error has occurred')
            .should('be.visible')
            .scrollIntoView();

          // Confirm that user input errors (4xx responses) associated with fields get displayed.
          // Simulate a mock API error associated with each field to confirm that the message is always visible.
          [
            'linode_firewall_id',
            'nodebalancer_firewall_id',
            'public_interface_firewall_id',
            'vpc_interface_firewall_id',
          ].forEach((interfaceTypeField) => {
            const mockErrorMessage = `A disabled firewall cannot be used as a default firewall. Please enable the firewall first. (${interfaceTypeField})`;
            mockUpdateFirewallSettingsError(
              {
                reason: mockErrorMessage,
                field: interfaceTypeField,
              },
              400
            );

            ui.button
              .findByTitle('Save')
              .should('be.visible')
              .should('be.enabled')
              .click();

            cy.findByText(mockErrorMessage)
              .should('be.visible')
              .scrollIntoView();
          });
        });
    });
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
