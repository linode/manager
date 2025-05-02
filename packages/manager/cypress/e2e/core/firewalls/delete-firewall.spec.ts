import { createFirewall } from '@linode/api-v4';
import { authenticate } from 'support/api/authentication';
import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetFirewalls,
  mockGetFirewallSettings,
} from 'support/intercepts/firewalls';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

import { accountFactory, firewallFactory } from 'src/factories';
import { DEFAULT_FIREWALL_TOOLTIP_TEXT } from 'src/features/Firewalls/FirewallLanding/constants';

import type { Firewall } from '@linode/api-v4';

authenticate();
// Firewall GET API request performance issues need to be addressed in order to unskip this test
// See M3-9619
describe('delete firewall', () => {
  // TODO Restore clean-up when `deletes a firewall` test is unskipped.
  // before(() => {
  //   cleanUp('firewalls');
  // });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Clicks "Delete" action menu item for firewall but cancels operation.
   * - Clicks "Delete" action menu item for firewall and confirms operation.
   * - Confirms that firewall is still in landing page list after canceled operation.
   * - Confirms that firewall is removed from landing page list after confirmed operation.
   */
  it.skip('deletes a firewall', () => {
    const firewallRequest = firewallFactory.build({
      label: randomLabel(),
    });

    cy.defer(() => createFirewall(firewallRequest), 'creating firewalls').then(
      (firewall: Firewall) => {
        cy.visitWithLogin('/firewalls');

        // Confirm that firewall is listed and initiate deletion.
        cy.findByText(firewall.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Delete').should('be.visible');
            cy.findByText('Delete').click();
          });

        // Cancel deletion when prompted to confirm.
        ui.dialog
          .findByTitle(`Delete Firewall ${firewall.label}?`)
          .should('be.visible')
          .within(() => {
            ui.buttonGroup
              .findButtonByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that firewall is still listed and initiate deletion again.
        cy.findByText(firewall.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Delete').should('be.visible');
            cy.findByText('Delete').click();
          });

        // Confirm deletion.
        ui.dialog
          .findByTitle(`Delete Firewall ${firewall.label}?`)
          .should('be.visible')
          .within(() => {
            ui.buttonGroup
              .findButtonByTitle('Delete Firewall')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        // Confirm that firewall is deleted.
        cy.visitWithLogin('/firewalls');
        cy.findByText(firewall.label).should('not.exist');
      }
    );
  });

  /*
   * - Confirms that Firewalls that are designated as default cannot be deleted or disabled.
   * - Confirms that Firewalls that are not designated as default can be deleted and disabled.
   */
  it('cannot delete default Firewalls', () => {
    const mockFirewallDefaultConfig = firewallFactory.build();
    const mockFirewallDefaultVpc = firewallFactory.build();
    const mockFirewallDefaultPublic = firewallFactory.build();
    const mockFirewallDefaultNodeBalancer = firewallFactory.build();
    const mockFirewallNotDefault = firewallFactory.build();

    const mockFirewallDefaults = [
      mockFirewallDefaultConfig,
      mockFirewallDefaultVpc,
      mockFirewallDefaultPublic,
      mockFirewallDefaultNodeBalancer,
    ];
    const mockFirewalls = [...mockFirewallDefaults, mockFirewallNotDefault];

    // TODO M3-9775 - Delete feature flag mocks once `linodeInterfaces` flag is deleted.
    mockAppendFeatureFlags({
      linodeInterfaces: {
        enabled: true,
      },
    });

    // TODO Delete account capability mock once all accounts have Linode interfaces capability.
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Cloud Firewall', 'Linode Interfaces', 'Linodes'],
      })
    );

    mockGetFirewalls(mockFirewalls);
    mockGetFirewallSettings({
      default_firewall_ids: {
        linode: mockFirewallDefaultConfig.id,
        nodebalancer: mockFirewallDefaultNodeBalancer.id,
        vpc_interface: mockFirewallDefaultVpc.id,
        public_interface: mockFirewallDefaultPublic.id,
      },
    });

    cy.visitWithLogin('/firewalls');

    // Confirm that each Firewall that is designated as a default is listed
    // as expected and that they cannot be disabled or deleted.
    mockFirewallDefaults.forEach((mockFirewall) => {
      cy.findByText(mockFirewall.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText('DEFAULT').should('be.visible');
          ui.button
            .findByTitle('Disable')
            .should('be.visible')
            .should('be.disabled')
            .focus();

          ui.tooltip
            .findByText(DEFAULT_FIREWALL_TOOLTIP_TEXT)
            .should('be.visible');

          ui.button
            .findByTitle('Delete')
            .should('be.visible')
            .should('be.disabled')
            .focus();

          ui.tooltip
            .findByText(DEFAULT_FIREWALL_TOOLTIP_TEXT)
            .should('be.visible');

          // Dismiss the tooltip by focusing on another element.
          cy.findByText(mockFirewall.label).focus();
        });
    });

    // Confirm that Firewalls that are not designated as default can be disabled
    // and deleted as expected.
    cy.findByText(mockFirewallNotDefault.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('DEFAULT').should('not.exist');

        ui.button
          .findByTitle('Disable')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.dialog
      .findByTitle(`Disable Firewall ${mockFirewallNotDefault.label}?`)
      .should('be.visible')
      .within(() => {
        ui.button.findByTitle('Cancel').should('be.visible').click();
      });

    cy.findByText(mockFirewallNotDefault.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        ui.button
          .findByTitle('Delete')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    ui.dialog
      .findByTitle(`Delete Firewall ${mockFirewallNotDefault.label}?`)
      .should('be.visible');
  });
});
