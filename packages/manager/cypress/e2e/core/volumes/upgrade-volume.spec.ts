import {
  eventFactory,
  linodeFactory,
  notificationFactory,
  volumeFactory,
} from '@src/factories';
import { mockGetEvents, mockGetNotifications } from 'support/intercepts/events';
import {
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import { mockMigrateVolumes, mockGetVolumes } from 'support/intercepts/volumes';
import { ui } from 'support/ui';

describe('volume upgrade/migration', () => {
  it('can upgrade an unattached volume to NVMe', () => {
    const volume = volumeFactory.build();

    const migrationScheduledNotification = notificationFactory.build({
      type: 'volume_migration_scheduled',
      entity: { type: 'volume', id: volume.id },
    });

    mockGetVolumes([volume]).as('getVolumes');
    mockMigrateVolumes().as('migrateVolumes');
    mockGetNotifications([migrationScheduledNotification]).as(
      'getNotifications'
    );

    cy.visitWithLogin('/volumes');

    cy.wait(['@getVolumes', '@getNotifications']);

    cy.findByText('UPGRADE TO NVMe')
      .should('be.visible')
      .should('be.enabled')
      .click();

    const migrationImminentNotification = notificationFactory.build({
      type: 'volume_migration_imminent',
      entity: { type: 'volume', id: volume.id },
    });
    mockGetNotifications([migrationImminentNotification]).as(
      'getNotifications'
    );

    ui.dialog.findByTitle(`Upgrade Volume ${volume.label}`).within(() => {
      ui.button
        .findByTitle('Enter Upgrade Queue')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait(['@migrateVolumes', '@getNotifications']);

    cy.findByText('UPGRADE PENDING').should('be.visible');

    for (const percentage of [10, 20, 50, 75]) {
      const mockStartedMigrationEvent = eventFactory.build({
        action: 'volume_migrate',
        entity: { id: volume.id, type: 'volume' },
        status: 'started',
        percent_complete: percentage,
      });

      mockGetEvents([mockStartedMigrationEvent]).as('getEvents');

      cy.wait('@getEvents');

      cy.findByText(`migrating (${percentage}%)`).should('be.visible');
    }

    const mockFinishedMigrationEvent = eventFactory.build({
      action: 'volume_migrate',
      entity: { id: volume.id, type: 'volume', label: volume.label },
      status: 'finished',
    });

    mockGetEvents([mockFinishedMigrationEvent]).as('getEvents');
    mockGetNotifications([]).as('getNotifications');

    cy.wait(['@getEvents', '@getVolumes', '@getNotifications']);

    mockGetEvents([]);

    cy.findByText('active').should('be.visible');

    ui.toast.assertMessage(`Volume ${volume.label} successfully upgraded.`);
  });

  it('can upgrade an attached volume from the volumes landing page', () => {
    const linode = linodeFactory.build();
    const volume = volumeFactory.build({
      linode_id: linode.id,
      linode_label: linode.label,
    });

    const migrationScheduledNotification = notificationFactory.build({
      type: 'volume_migration_scheduled',
      entity: { type: 'volume', id: volume.id },
    });

    mockGetVolumes([volume]).as('getVolumes');
    mockMigrateVolumes().as('migrateVolumes');
    mockGetLinodeDetails(linode.id, linode).as('getLinode');
    mockGetLinodeDisks(linode.id, []);
    mockGetNotifications([migrationScheduledNotification]).as(
      'getNotifications'
    );
    mockGetLinodeVolumes(linode.id, [volume]).as('getLinodeVolumes');

    cy.visitWithLogin('/volumes');

    cy.wait(['@getVolumes', '@getNotifications']);

    cy.findByText('UPGRADE TO NVMe')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('contain', `/linodes/${linode.id}/storage?upgrade=true`);

    cy.wait(['@getLinode', '@getLinodeVolumes']);

    const migrationImminentNotification = notificationFactory.build({
      type: 'volume_migration_imminent',
      entity: { type: 'volume', id: volume.id },
    });
    mockGetNotifications([migrationImminentNotification]).as(
      'getNotifications'
    );

    ui.dialog.findByTitle('Upgrade Volume').within(() => {
      cy.findByText(
        `A Volume attached to Linode ${linode.label} will be upgraded to high-performance NVMe Block Storage.`,
        { exact: false }
      ).should('be.visible');

      ui.button
        .findByTitle('Enter Upgrade Queue')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
    cy.wait(['@migrateVolumes', '@getNotifications']);

    cy.findByText('UPGRADE PENDING').should('be.visible');

    for (const percentage of [10, 20, 50, 75]) {
      const mockStartedMigrationEvent = eventFactory.build({
        action: 'volume_migrate',
        entity: { id: volume.id, type: 'volume' },
        status: 'started',
        percent_complete: percentage,
      });

      mockGetEvents([mockStartedMigrationEvent]).as('getEvents');

      cy.wait('@getEvents');

      cy.findByText(`migrating (${percentage}%)`).should('be.visible');
    }

    const mockFinishedMigrationEvent = eventFactory.build({
      action: 'volume_migrate',
      entity: { id: volume.id, type: 'volume', label: volume.label },
      status: 'finished',
    });

    mockGetEvents([mockFinishedMigrationEvent]).as('getEvents');
    mockGetNotifications([]).as('getNotifications');

    cy.wait(['@getEvents', '@getLinodeVolumes', '@getNotifications']);

    mockGetEvents([]);

    cy.findByText('active').should('be.visible');

    ui.toast.assertMessage(`Volume ${volume.label} successfully upgraded.`);
  });

  it('can upgrade an attached volume from the linode details page', () => {
    const linode = linodeFactory.build();
    const volume = volumeFactory.build({
      linode_id: linode.id,
      linode_label: linode.label,
    });

    const migrationScheduledNotification = notificationFactory.build({
      type: 'volume_migration_scheduled',
      entity: { type: 'volume', id: volume.id },
    });

    mockMigrateVolumes().as('migrateVolumes');
    mockGetLinodeDetails(linode.id, linode).as('getLinode');
    mockGetLinodeDisks(linode.id, []);
    mockGetNotifications([migrationScheduledNotification]).as(
      'getNotifications'
    );
    mockGetLinodeVolumes(linode.id, [volume]).as('getLinodeVolumes');

    cy.visitWithLogin(`/linodes/${linode.id}/storage`);

    cy.wait(['@getLinode', '@getLinodeVolumes', '@getNotifications']);

    ui.button
      .findByTitle('Upgrade Volume')
      .should('be.visible')
      .should('be.enabled')
      .click();

    const migrationImminentNotification = notificationFactory.build({
      type: 'volume_migration_imminent',
      entity: { type: 'volume', id: volume.id },
    });
    mockGetNotifications([migrationImminentNotification]).as(
      'getNotifications'
    );

    ui.dialog.findByTitle('Upgrade Volume').within(() => {
      cy.findByText(
        `A Volume attached to Linode ${linode.label} will be upgraded to high-performance NVMe Block Storage.`,
        { exact: false }
      ).should('be.visible');

      ui.button
        .findByTitle('Enter Upgrade Queue')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });
    cy.wait(['@migrateVolumes', '@getNotifications']);

    cy.findByText('UPGRADE PENDING').should('be.visible');

    for (const percentage of [10, 20, 50, 75]) {
      const mockStartedMigrationEvent = eventFactory.build({
        action: 'volume_migrate',
        entity: { id: volume.id, type: 'volume' },
        status: 'started',
        percent_complete: percentage,
      });

      mockGetEvents([mockStartedMigrationEvent]).as('getEvents');

      cy.wait('@getEvents');

      cy.findByText(`migrating (${percentage}%)`).should('be.visible');
    }

    const mockFinishedMigrationEvent = eventFactory.build({
      action: 'volume_migrate',
      entity: { id: volume.id, type: 'volume', label: volume.label },
      status: 'finished',
    });

    mockGetEvents([mockFinishedMigrationEvent]).as('getEvents');
    mockGetNotifications([]).as('getNotifications');

    cy.wait(['@getEvents', '@getLinodeVolumes', '@getNotifications']);

    mockGetEvents([]);

    cy.findByText('active').should('be.visible');

    ui.toast.assertMessage(`Volume ${volume.label} successfully upgraded.`);
  });
});
