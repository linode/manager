import { linodeFactory, profileFactory } from '@linode/utilities';
import { mockGetMaintenance } from 'support/intercepts/account';
import { mockGetNotifications } from 'support/intercepts/events';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinode, mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountMaintenanceFactory } from 'src/factories';

describe('host & VM maintenance notification banner', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
      iamRbacPrimaryNavChanges: {
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
    const mockLinodeMaintenances = [
      accountMaintenanceFactory.build({
        entity: {
          id: mockLinodes[0].id,
          label: mockLinodes[0].label,
          type: 'linode',
          url: `/v4/linode/instances/${mockLinodes[0].id}`,
        },
        maintenance_policy_set: 'linode/power_off_on',
        status: 'scheduled',
        start_time: '2022-01-17T23:45:46.960',
      }),
      accountMaintenanceFactory.build({
        entity: {
          id: mockLinodes[1].id,
          label: mockLinodes[1].label,
          type: 'linode',
          url: `/v4/linode/instances/${mockLinodes[1].id}`,
        },
        maintenance_policy_set: 'linode/power_off_on',
        status: 'scheduled',
      }),
    ];
    cy.wrap(mockLinodeMaintenances).as('mockLinodeMaintenances');
    // suppress platform notifications to prevent other notification banners

    mockGetNotifications([]).as('getNotifications');
    const mockProfile = profileFactory.build({
      timezone: 'America/New_York',
    });
    mockGetProfile(mockProfile).as('getProfile');
  });

  it('maintenance notification banner on landing page for 1 linode', function () {
    mockGetMaintenance([this.mockLinodeMaintenances[0]], []).as(
      'getMaintenances'
    );
    cy.visitWithLogin('/linodes');
    cy.wait([
      '@getLinodes',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
    ]);
    cy.get('[data-qa-maintenance-banner-v2="true"]').within(() => {
      cy.get('p')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal(
            '1 Linode has upcoming scheduled maintenance. For more details, view Account Maintenance.'
          );
        });
      cy.get('a').should('be.visible').and('have.attr', 'href', '/maintenance');
    });
  });

  it('maintenance notification banner on landing page for >1 linodes', function () {
    mockGetMaintenance(this.mockLinodeMaintenances, []).as('getMaintenances');
    cy.visitWithLogin('/linodes');
    cy.wait([
      '@getLinodes',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
    ]);
    cy.get('[data-qa-maintenance-banner-v2="true"]').within(() => {
      cy.get('p')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal(
            '2 Linodes have upcoming scheduled maintenance. For more details, view Account Maintenance.'
          );
        });
      cy.get('a').should('be.visible').and('have.attr', 'href', '/maintenance');
    });
  });

  it('banner present on details page when linode has pending maintenance', function () {
    const mockLinode = this.mockLinodes[0];
    mockGetLinode(mockLinode.id, mockLinode).as('getLinode');
    const mockMaintenance = this.mockLinodeMaintenances[0];
    mockGetMaintenance([mockMaintenance], []).as('getMaintenances');

    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.wait([
      '@getLinode',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
      '@getProfile',
    ]);
    cy.get('[data-qa-maintenance-banner="true"]').within(() => {
      cy.get('p')
        .invoke('text')
        .then((text) => {
          // warning msg varries acc to linode label, emergency/scheduled, maintenance type, and date. use EST tz for -6 hr offset
          expect(text.trim()).to.equal(
            `Linode ${mockLinode.label} ${mockMaintenance.description} maintenance ${mockMaintenance.type.replace('_', ' ')} will begin 01/17/2022 at 18:45. For more details, view Account Maintenance.`
          );
        });
      cy.get('a')
        .should('be.visible')
        .and('have.attr', 'href', '/account/maintenance');
    });
  });

  it('maintenance notification banner not present on landing page if no linodes have pending maintenance', () => {
    mockGetMaintenance([], []).as('getMaintenances');
    cy.visitWithLogin('/linodes');
    cy.wait([
      '@getLinodes',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
    ]);
    cy.get('[data-qa-maintenance-banner-v2="true"]').should('not.exist');
  });

  it('banner not present on details page if no pending maintenance', function () {
    mockGetMaintenance([], []).as('getMaintenances');
    const mockLinode = this.mockLinodes[0];
    mockGetLinode(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${this.mockLinodes[0].id}`);
    cy.wait([
      '@getLinode',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
    ]);
    cy.get('[data-qa-maintenance-banner="true"]').should('not.exist');
  });
});
