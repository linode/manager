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

const mockEnabledRegion = regionFactory.build({
  capabilities: ['Linodes', 'Maintenance Policy'],
});
const mockDisabledRegion = regionFactory.build({
  capabilities: ['Linodes'],
});
const mockMaintenancePolicyMigrate = maintenancePolicyFactory.build({
  slug: 'linode/migrate',
  label: 'Migrate',
  type: 'linode_migrate',
});
const mockMaintenancePolicyPowerOnOff = maintenancePolicyFactory.build({
  slug: 'linode/power_off_on',
  label: 'Power Off / Power On',
  type: 'linode_power_off_on',
});
const mockLinode = linodeFactory.build({
  id: randomNumber(),
  label: randomLabel(),
  region: mockEnabledRegion.id,
});

describe('vmHostMaintenance feature flag', () => {
  beforeEach(() => {
    mockGetAccountSettings(
      accountSettingsFactory.build({
        maintenance_policy: 'linode/power_off_on',
      })
    ).as('getAccountSettings');
    mockGetRegions([mockEnabledRegion, mockDisabledRegion]).as('getRegions');
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
    mockGetMaintenancePolicies([
      mockMaintenancePolicyMigrate,
      mockMaintenancePolicyPowerOnOff,
    ]).as('getMaintenancePolicies');
    // cy.wrap(mockMaintenancePolicyPowerOnOff).as('mockMaintenancePolicyPowerOnOff');
  });

  it('VM host maintenance setting is editable when vmHostMaintenance feature flag is enabled. Mocked success.', () => {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
    }).as('getFeatureFlags');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/settings`);
    cy.wait([
      '@getAccountSettings',
      '@getFeatureFlags',
      '@getMaintenancePolicies',
      '@getDisks',
    ]);
    mockUpdateLinode(mockLinode.id, {
      ...mockLinode,
      maintenance_policy: mockMaintenancePolicyPowerOnOff.slug,
    }).as('updateLinode');

    cy.contains('Host Maintenance Policy').should('be.visible');
    cy.contains('Maintenance Policy').should('be.visible');
    ui.autocomplete.findByLabel('Maintenance Policy').as('maintenanceInput');
    cy.get('@maintenanceInput')
      .should('be.visible')
      .should('have.value', mockMaintenancePolicyMigrate.label);
    cy.get('@maintenanceInput')
      .closest('form')
      .within(() => {
        // save button for the host maintenance setting is disabled before edits
        ui.button.findByTitle('Save').should('be.disabled');
        // make edit
        cy.get('@maintenanceInput').click();
        cy.focused().type(`${mockMaintenancePolicyPowerOnOff.label}`);
        ui.autocompletePopper
          .findByTitle(mockMaintenancePolicyPowerOnOff.label)
          .should('be.visible')
          .click();
        // save button is enabled after edit
        ui.button.findByTitle('Save').should('be.enabled').click();
      });

    // POST payload should include maintenance_policy
    cy.wait('@updateLinode').then((intercept) => {
      expect(intercept.request.body['maintenance_policy']).to.eq(
        mockMaintenancePolicyPowerOnOff.slug
      );
    });

    // toast notification
    ui.toast.assertMessage('Host Maintenance Policy settings updated.');
  });

  it('VM host maintenance setting is editable when vmHostMaintenance feature flag is enabled. Mocked failure.', () => {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
    }).as('getFeatureFlags');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/settings`);
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
      mockLinode.id,
      linodeError.errorMessage,
      linodeError.statusCode
    );

    cy.contains('Host Maintenance Policy').should('be.visible');
    cy.contains('Maintenance Policy').should('be.visible');
    ui.autocomplete.findByLabel('Maintenance Policy').as('maintenanceInput');
    cy.get('@maintenanceInput')
      .should('be.visible')
      .should('have.value', mockMaintenancePolicyMigrate.label);
    cy.get('@maintenanceInput')
      .closest('form')
      .within(() => {
        // save button for the host maintenance setting is disabled before edits
        ui.button.findByTitle('Save').should('be.disabled');
        // make edit
        cy.get('@maintenanceInput').click();
        cy.focused().type(`${mockMaintenancePolicyPowerOnOff.label}`);
        ui.autocompletePopper
          .findByTitle(mockMaintenancePolicyPowerOnOff.label)
          .should('be.visible')
          .click();
        // save button is enabled after edit
        ui.button.findByTitle('Save').should('be.enabled').click();
      });

    cy.get('[data-qa-textfield-error-text="Maintenance Policy"]')
      .should('be.visible')
      .should('have.text', linodeError.errorMessage);
    cy.get('[aria-errormessage]').should('be.visible');
  });

  it('Maintenance policy setting is absent when feature flag is disabled', () => {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: false,
      },
    }).as('getFeatureFlags');
    cy.visitWithLogin(`/linodes/${mockLinode.id}/settings`);
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
