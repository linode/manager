/**
 * Integration tests involving Host Maintenance Policy account settings.
 */

import {
  mockGetAccountSettings,
  mockUpdateAccountSettings,
  mockUpdateAccountSettingsError,
} from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetMaintenancePolicies } from 'support/intercepts/maintenance';
import { ui } from 'support/ui';

import { accountSettingsFactory } from 'src/factories';
import { maintenancePolicyFactory } from 'src/factories/maintenancePolicy';

describe('Host Maintenance Policy account settings', () => {
  const mockMaintenancePolicies = [
    maintenancePolicyFactory.build({
      slug: 'linode/migrate',
      label: 'Migrate',
      type: 'linode_migrate',
    }),
    maintenancePolicyFactory.build({
      slug: 'linode/power_off_on',
      label: 'Power Off / Power On',
      type: 'linode_power_off_on',
    }),
  ];

  describe('When feature flag is enabled', () => {
    beforeEach(() => {
      mockAppendFeatureFlags({
        vmHostMaintenance: {
          enabled: true,
        },
      });
      mockGetMaintenancePolicies(mockMaintenancePolicies);
    });

    /*
     * - Confirms that the value of the "Maintenance Policy" drop-down matches the account setting on page load.
     */
    it('shows the expected maintenance policy in the drop-down', () => {
      mockMaintenancePolicies.forEach((maintenancePolicy) => {
        mockGetAccountSettings(
          accountSettingsFactory.build({
            maintenance_policy: maintenancePolicy.slug,
          })
        );

        cy.visitWithLogin('/account/settings');
        cy.findByText('Host Maintenance Policy')
          .should('be.visible')
          .closest('[data-qa-paper]')
          .within(() => {
            cy.findByLabelText('Maintenance Policy').should(
              'have.value',
              maintenancePolicy.label
            );
          });
      });
    });

    /*
     * - Confirms that the user can update their default maintenance policy.
     * - Confirms that Cloud Manager displays API errors upon unsuccessful account settings update.
     * - Confirms that Cloud Manager shows toast notification upon successful account settings update.
     */
    it('can update the default maintenance policy type', () => {
      mockGetAccountSettings(
        accountSettingsFactory.build({
          maintenance_policy: 'linode/migrate',
        })
      );
      mockUpdateAccountSettingsError('An unknown error occurred', 500).as(
        'updateMaintenancePolicy'
      );

      cy.visitWithLogin('/account/settings');
      cy.findByText('Host Maintenance Policy')
        .should('be.visible')
        .closest('[data-qa-paper]')
        .within(() => {
          ui.button
            .findByTitle('Save Maintenance Policy')
            .should('be.disabled');

          // Change the maintenance policy selection from "Migrate" to "Power Off / Power On".
          cy.findByLabelText('Maintenance Policy').clear();
          ui.autocompletePopper.find().within(() => {
            cy.contains('Power Off / Power On').should('be.visible').click();
          });
          cy.findByLabelText('Maintenance Policy').should(
            'have.value',
            'Power Off / Power On'
          );

          // Confirm that "Save Maintenance Policy" button becomes enabled and click it,
          // then that Cloud Manager displays an error message if an API error occurs.
          ui.button
            .findByTitle('Save Maintenance Policy')
            .should('be.enabled')
            .click();
          cy.wait('@updateMaintenancePolicy');
          cy.findByText('An unknown error occurred').should('be.visible');

          // Click the "Save Maintenance Policy" button again, this time confirm
          // that Cloud responds as expected upon receiving a successful API response.
          mockUpdateAccountSettings(
            accountSettingsFactory.build({
              maintenance_policy: 'linode/power_off_on',
            })
          ).as('updateMaintenancePolicy');

          ui.button
            .findByTitle('Save Maintenance Policy')
            .should('be.enabled')
            .click();
          cy.wait('@updateMaintenancePolicy').then((xhr) => {
            expect(xhr.request.body.maintenance_policy).to.equal(
              'linode/power_off_on'
            );
          });
        });

      ui.toast.assertMessage('Host Maintenance Policy settings updated.');
    });
  });

  // TODO M3-10046 - Delete feature flag negative tests when "vmHostMaintenance" feature flag is removed.
  describe('When feature flag is disabled', () => {
    /*
     * - Confirms that the "Host Maintenance Policy" section is absent when `vmHostMaintenance` is disabled.
     */
    it('does not show Host Maintenance Policy section on settings page', () => {
      mockAppendFeatureFlags({
        vmHostMaintenance: {
          enabled: false,
        },
      });

      cy.visitWithLogin('/account/settings');

      // Confirm that page contents has loaded by confirming that certain content
      // is visible. We'll assert that the Linode Managed informational text is present.
      cy.contains(
        'Linode Managed includes Backups, Longview Pro, cPanel, and round-the-clock monitoring'
      );

      // Confirm that the "Host Maintenance Policy" section is absent.
      cy.findByText('Host Maintenance Policy').should('not.exist');
    });
  });
});
