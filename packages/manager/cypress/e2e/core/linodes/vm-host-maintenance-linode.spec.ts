import { linodeFactory, profileFactory } from '@linode/utilities';
import { mockGetMaintenance } from 'support/intercepts/account';
import { mockGetNotifications } from 'support/intercepts/events';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinode, mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountMaintenanceFactory } from 'src/factories';

const mockProfile = profileFactory.build({
  timezone: 'America/New_York',
});

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

const mockMaintenanceScheduled = accountMaintenanceFactory.build({
  entity: {
    id: mockLinodes[0].id,
    label: mockLinodes[0].label,
    type: 'linode',
    url: `/v4/linode/instances/${mockLinodes[0].id}`,
  },
  type: 'reboot',
  description: 'scheduled',
  maintenance_policy_set: 'linode/power_off_on',
  reason:
    "Your Linode's host has reached the end of its life cycle and will be retired.",
  status: 'scheduled',
  start_time: '2022-01-17T23:45:46.960',
});

const mockMaintenanceEmergency = accountMaintenanceFactory.build({
  entity: {
    id: mockLinodes[1].id,
    label: mockLinodes[1].label,
    type: 'linode',
    url: `/v4/linode/instances/${mockLinodes[1].id}`,
  },
  type: 'cold_migration',
  description: 'emergency',
  maintenance_policy_set: 'linode/power_off_on',
  reason: "We must upgrade the OS of your Linode's host.",
  status: 'scheduled',
});

describe('Host & VM maintenance notification banner', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      vmHostMaintenance: {
        enabled: true,
      },
      iam: {
        enabled: false,
      },
    }).as('getFeatureFlags');

    mockGetLinodes(mockLinodes).as('getLinodes');
    mockGetNotifications([]).as('getNotifications');
    mockGetProfile(mockProfile).as('getProfile');
  });

  it('maintenance notification banner on landing page for 1 linode', function () {
    mockGetMaintenance([mockMaintenanceScheduled], []).as('getMaintenances');
    cy.visitWithLogin('/linodes');
    cy.wait([
      '@getLinodes',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
    ]);

    cy.contains(
      '1 Linode has upcoming scheduled maintenance. For more details, view Account Maintenance.'
    )
      .should('be.visible')
      .within(() => {
        cy.findByText('Account Maintenance').click();
        cy.url().should('endWith', '/maintenance');
      });
  });

  it('maintenance notification banner on landing page for >1 linodes', function () {
    mockGetMaintenance(
      [mockMaintenanceEmergency, mockMaintenanceScheduled],
      []
    ).as('getMaintenances');
    cy.visitWithLogin('/linodes');
    cy.wait([
      '@getLinodes',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
    ]);

    cy.contains(
      '2 Linodes have upcoming scheduled maintenance. For more details, view Account Maintenance.'
    )
      .should('be.visible')
      .within(() => {
        cy.findByText('Account Maintenance').click();
        cy.url().should('endWith', '/maintenance');
      });
  });

  it('maintenance notification banner does not display platform maintenance messages', function () {
    const mockPlatformMaintenance = accountMaintenanceFactory.build({
      entity: {
        id: mockLinodes[1].id,
        label: mockLinodes[1].label,
        type: 'linode',
        url: `/v4/linode/instances/${mockLinodes[1].id}`,
      },
      type: 'reboot',
      description: 'emergency',
      maintenance_policy_set: 'linode/power_off_on',
      // 'critical security update' in reason prevents message from displaying
      reason: "We must apply a critical security update to your Linode's host.",
      status: 'scheduled',
    });
    mockGetMaintenance([mockPlatformMaintenance], []).as('getMaintenances');
    cy.visitWithLogin('/linodes');
    cy.wait([
      '@getLinodes',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
    ]);
    cy.get('#main-content').within(() => {
      ui.button
        .findByTitle('Create Linode')
        .should('be.visible')
        .should('be.enabled');
      cy.get('[data-testid="maintenance-banner').should('not.exist');
    });
  });

  it('banner present on details page when linode has pending maintenance', function () {
    const mockLinode = mockLinodes[0];
    mockGetLinode(mockLinode.id, mockLinode).as('getLinode');
    mockGetMaintenance([mockMaintenanceScheduled], []).as('getMaintenances');

    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.wait([
      '@getLinode',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
      '@getProfile',
    ]);

    cy.contains(
      `Linode ${mockLinode.label} scheduled maintenance reboot will begin 01/17/2022 at 18:45. For more details, view Account Maintenance`
    )
      .should('be.visible')
      .within(() => {
        cy.findByText('Account Maintenance').click();
        cy.url().should('endWith', '/maintenance');
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
    const mockLinode = mockLinodes[0];
    mockGetMaintenance([], []).as('getMaintenances');
    mockGetLinode(mockLinode.id, mockLinode).as('getLinode');
    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.wait([
      '@getLinode',
      '@getFeatureFlags',
      '@getNotifications',
      '@getMaintenances',
    ]);
    cy.get('[data-qa-maintenance-banner="true"]').should('not.exist');
  });
});
