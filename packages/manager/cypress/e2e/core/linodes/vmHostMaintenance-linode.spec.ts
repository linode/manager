import { linodeFactory } from '@linode/utilities';
import { mockGetMaintenance } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinode, mockGetLinodes } from 'support/intercepts/linodes';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountMaintenanceFactory } from 'src/factories';

describe('host & VM maintenance notification banner', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
    }).as('getFeatureFlags');
    const mockLinodes = [
      linodeFactory.build({
        label: randomLabel(),
        region: chooseRegion().id,
      }),
      linodeFactory.build({
        label: randomLabel(),
        region: chooseRegion().id,
      }),
    ];
    cy.wrap(mockLinodes).as('mockLinodes');
    mockGetLinodes(mockLinodes).as('getLinodes');
    const mockLinodeMaintenance = accountMaintenanceFactory.build({
      entity: {
        id: mockLinodes[0].id,
        label: mockLinodes[0].label,
        type: 'linode',
        url: `/v4/linode/instances/${mockLinodes[0].id}`,
      },
      maintenance_policy_set: 'linode/power_off_on',
      status: 'scheduled',
      start_time: '2022-01-17T23:45:46.960',
    });
    cy.wrap(mockLinodeMaintenance).as('mockLinodeMaintenance');
  });

  it('maintenance notification banner on landing page for 1 linode', function () {
    mockGetMaintenance([this.mockLinodeMaintenance], []).as('getMaintenance');
    cy.visitWithLogin('/linodes');
    cy.wait(['@getLinodes', '@getFeatureFlags', '@getMaintenance']);
    cy.findByTestId('notice-warning').within(() => {
      cy.get('p')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal(
            '1 Linode has upcoming scheduled maintenance. For more details, view Account Maintenance.'
          );
        });
      cy.get('a')
        .should('be.visible')
        .and('have.attr', 'href', '/account/maintenance');
    });
  });

  it('maintenance notification banner on landing page for >1 linodes', function () {
    const mockMaintenance2 = accountMaintenanceFactory.build({
      entity: {
        id: this.mockLinodes[1].id,
        label: this.mockLinodes[1].label,
        type: 'linode',
        url: `/v4/linode/instances/${this.mockLinodes[1].id}`,
      },
      maintenance_policy_set: 'linode/power_off_on',
      status: 'scheduled',
    });
    mockGetMaintenance([this.mockLinodeMaintenance, mockMaintenance2], []).as(
      'getMaintenance'
    );
    cy.visitWithLogin('/linodes');
    cy.wait(['@getLinodes', '@getFeatureFlags', '@getMaintenance']);
    cy.findByTestId('notice-warning').within(() => {
      cy.get('p')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal(
            '2 Linodes have upcoming scheduled maintenance. For more details, view Account Maintenance.'
          );
        });
      cy.get('a')
        .should('be.visible')
        .and('have.attr', 'href', '/account/maintenance');
    });
  });

  it('maintenance notification banner not present on landing page if no linodes have pending maintenance', () => {
    mockGetMaintenance([], []).as('getMaintenance');
    cy.visitWithLogin('/linodes');
    cy.wait(['@getLinodes', '@getFeatureFlags', '@getMaintenance']);
    cy.findByTestId('notice-warning').should('not.exist');
  });

  it('banner present on details page when linode has pending maintenance', function () {
    const mockLinode = this.mockLinodes[0];
    mockGetLinode(mockLinode.id, mockLinode).as('getLinode');
    const mockMaintenance = this.mockLinodeMaintenance;
    mockGetMaintenance([mockMaintenance], []).as('getMaintenance');

    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.wait(['@getLinode', '@getFeatureFlags', '@getMaintenance']);
    cy.findByTestId('linode-maintenance-banner').within(() => {
      cy.get('p')
        .invoke('text')
        .then((text) => {
          // warning msg varries acc to linode label, emergency/scheduled, maintenance type, and date.
          expect(text.trim()).to.equal(
            `Linode ${mockLinode.label} ${mockMaintenance.description} maintenance ${mockMaintenance.type.replace('_', ' ')} will begin 01/17/2022 at 23:45. For more details, view Account Maintenance.`
          );
        });
      cy.get('a')
        .should('be.visible')
        .and('have.attr', 'href', '/account/maintenance');
    });
  });

  it('banner not present on details page if no pending maintenance', function () {
    mockGetMaintenance([], []).as('getMaintenance');
    const mockLinode = this.mockLinodes[0];
    mockGetLinode(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${this.mockLinodes[0].id}`);
    cy.wait(['@getLinode', '@getFeatureFlags', '@getMaintenance']);
    cy.findByTestId('linode-maintenance-banner').should('not.exist');
  });
});
