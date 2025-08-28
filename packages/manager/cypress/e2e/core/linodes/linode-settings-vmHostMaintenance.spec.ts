import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockGetAccountSettings } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockUpdateLinode,
  mockUpdateLinodeError,
} from 'support/intercepts/linodes';
import { mockGetMaintenancePolicies } from 'support/intercepts/maintenance';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';

import { accountSettingsFactory } from 'src/factories';
import { maintenancePolicyFactory } from 'src/factories/maintenancePolicy';

import type { Disk } from '@linode/api-v4';

describe('vmHostMaintenance feature flag', function () {
  beforeEach(() => {
    mockGetAccountSettings(
      accountSettingsFactory.build({
        maintenance_policy: 'linode/power_off_on',
      })
    ).as('getAccountSettings');
    const mockEnabledRegion = regionFactory.build({
      capabilities: ['Linodes', 'Maintenance Policy'],
    });
    const mockDisabledRegion = regionFactory.build({
      capabilities: ['Linodes'],
    });
    const mockRegions = [mockEnabledRegion, mockDisabledRegion];
    cy.wrap(mockRegions).as('mockRegions');
    mockGetRegions(mockRegions).as('getRegions');
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: mockRegions[0].id,
    });
    cy.wrap(mockLinode).as('mockLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    const mockDisk: Disk = {
      created: '2020-08-21T17:26:14',
      filesystem: 'ext4',
      id: 44311273,
      label: 'Debian 10 Disk',
      size: 81408,
      status: 'ready',
      updated: '2020-08-21T17:26:30',
    };
    mockGetLinodeDisks(mockLinode.id, [mockDisk]).as('getDisks');
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
    mockGetMaintenancePolicies(mockMaintenancePolicies).as(
      'getMaintenancePolicies'
    );
    cy.wrap(mockMaintenancePolicies).as('mockMaintenancePolicies');
  });

  it('VM host maintenance setting is editable when vmHostMaintenance feature flag is enabled. Mocked success.', function () {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
    }).as('getFeatureFlags');
    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/settings`);
    cy.wait([
      '@getAccountSettings',
      '@getFeatureFlags',
      '@getMaintenancePolicies',
      '@getDisks',
    ]);
    mockUpdateLinode(this.mockLinode.id, {
      ...this.mockLinode,
      maintenance_policy: this.mockMaintenancePolicies[1].slug,
    }).as('updateLinode');

    cy.contains('Host Maintenance Policy').should('be.visible');
    cy.contains('Maintenance Policy').should('be.visible');
    ui.autocomplete.findByLabel('Maintenance Policy').as('maintenanceInput');
    cy.get('@maintenanceInput')
      .should('be.visible')
      .should('have.value', this.mockMaintenancePolicies[0].label);
    cy.get('@maintenanceInput')
      .closest('form')
      .within(() => {
        // save button for the host maintenance setting is disabled before edits
        ui.button.findByTitle('Save').should('be.disabled');
        // make edit
        cy.get('@maintenanceInput').click();
        cy.focused().type(`${this.mockMaintenancePolicies[1].label}`);
        ui.autocompletePopper
          .findByTitle(this.mockMaintenancePolicies[1].label, { exact: false })
          .should('be.visible')
          .click();
        // save button is enabled after edit
        ui.button.findByTitle('Save').should('be.enabled').click();
      });

    // POST payload should include maintenance_policy
    cy.wait('@updateLinode').then((intercept) => {
      expect(intercept.request.body['maintenance_policy']).to.eq(
        this.mockMaintenancePolicies[1].slug
      );
      // request succeeds
      expect(intercept.response?.statusCode).to.eq(200);
    });

    // toast notification
    ui.toast.assertMessage('Host Maintenance Policy settings updated.');
  });

  it('VM host maintenance setting is editable when vmHostMaintenance feature flag is enabled. Mocked failure.', function () {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
    }).as('getFeatureFlags');
    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/settings`);
    cy.wait([
      '@getAccountSettings',
      '@getFeatureFlags',
      '@getMaintenancePolicies',
      '@getDisks',
    ]);
    const linodeError = {
      statusCode: 400,
      errorMessage: 'Linode update failed',
    };
    mockUpdateLinodeError(
      this.mockLinode.id,
      linodeError.errorMessage,
      linodeError.statusCode
    ).as('updateLinode');

    cy.contains('Host Maintenance Policy').should('be.visible');
    cy.contains('Maintenance Policy').should('be.visible');
    ui.autocomplete.findByLabel('Maintenance Policy').as('maintenanceInput');
    cy.get('@maintenanceInput')
      .should('be.visible')
      .should('have.value', this.mockMaintenancePolicies[0].label);
    cy.get('@maintenanceInput')
      .closest('form')
      .within(() => {
        // save button for the host maintenance setting is disabled before edits
        ui.button.findByTitle('Save').should('be.disabled');
        // make edit
        cy.get('@maintenanceInput').click();
        cy.focused().type(`${this.mockMaintenancePolicies[1].label}`);
        ui.autocompletePopper
          .findByTitle(this.mockMaintenancePolicies[1].label, { exact: false })
          .should('be.visible')
          .click();
        // save button is enabled after edit
        ui.button.findByTitle('Save').should('be.enabled').click();
      });

    // POST payload should include maintenance_policy
    cy.wait('@updateLinode').then((intercept) => {
      // expect(intercept.request.body['maintenance_policy']).to.eq(this.mockMaintenancePolicies[1].slug);
      // request fails
      expect(intercept.response?.statusCode).to.eq(linodeError.statusCode);
    });
    cy.get('[data-qa-textfield-error-text="Maintenance Policy"]')
      .should('be.visible')
      .should('have.text', linodeError.errorMessage);
    cy.get('[aria-errormessage]').should('be.visible');
  });

  it('Settings when vmHostMaintenance feature flag is disabled', function () {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: false,
      },
    }).as('getFeatureFlags');
    cy.visitWithLogin(`/linodes/${this.mockLinode.id}/settings`);
    cy.wait(['@getAccountSettings', '@getFeatureFlags', '@getDisks']);

    // "Host Maintenance Policy" section is not present
    cy.get('[data-reach-tab-panels]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Host Maintenance Policy').should('not.exist');
        cy.findByText('Maintenance Policy').should('not.exist');
        cy.get('[data-qa-panel="Host Maintenance Policy"]').should('not.exist');
      });
  });
});
