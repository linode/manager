import { linodeFactory } from '@linode/utilities';
import {
  eventFactory,
  notificationFactory,
  volumeFactory,
} from '@src/factories';
import { mockGetEvents, mockGetNotifications } from 'support/intercepts/events';
import {
  mockGetLinodeDetails,
  mockGetLinodeDisks,
  mockGetLinodeVolumes,
} from 'support/intercepts/linodes';
import {
  mockGetVolume,
  mockGetVolumes,
  mockMigrateVolumes,
} from 'support/intercepts/volumes';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';

describe('volume upgrade/migration', () => {
  it('can upgrade an unattached volume to NVMe', () => {
    const mockRegion = chooseRegion({ capabilities: ['Block Storage'] });
    const volume = volumeFactory.build({
      region: mockRegion.id,
    });

    const migrationScheduledNotification = notificationFactory.build({
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_scheduled',
    });

    mockGetVolumes([volume]).as('getVolumes');
    mockGetVolume(volume).as('getVolume');
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
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_imminent',
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

    cy.wait(['@migrateVolumes', '@getVolume', '@getNotifications']);

    cy.findByText('UPGRADE PENDING').should('be.visible');

    for (const percentage of [10, 20, 50, 75]) {
      const mockStartedMigrationEvent = eventFactory.build({
        action: 'volume_migrate',
        entity: { id: volume.id, type: 'volume' },
        percent_complete: percentage,
        status: 'started',
      });

      mockGetEvents([mockStartedMigrationEvent]).as('getEvents');

      cy.wait('@getEvents');

      cy.findByText(`Migrating (${percentage}%)`).should('be.visible');
    }

    const mockFinishedMigrationEvent = eventFactory.build({
      action: 'volume_migrate',
      entity: { id: volume.id, label: volume.label, type: 'volume' },
      status: 'finished',
    });

    mockGetEvents([mockFinishedMigrationEvent]).as('getEvents');
    mockGetNotifications([]).as('getNotifications');

    cy.wait(['@getEvents', '@getVolumes', '@getNotifications']);

    mockGetEvents([]);

    cy.findByText('Active').should('be.visible');

    ui.toast.assertMessage(`Volume ${volume.label} has been migrated to NVMe.`);
  });

  it('can upgrade an attached volume from the volumes landing page', () => {
    const mockRegion = chooseRegion({ capabilities: ['Block Storage'] });
    const linode = linodeFactory.build({
      region: mockRegion.id,
    });
    const volume = volumeFactory.build({
      linode_id: linode.id,
      linode_label: linode.label,
      region: mockRegion.id,
    });

    const migrationScheduledNotification = notificationFactory.build({
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_scheduled',
    });

    mockGetVolumes([volume]).as('getVolumes');
    mockMigrateVolumes().as('migrateVolumes');
    mockGetLinodeDetails(linode.id, linode).as('getLinode');
    mockGetLinodeVolumes(linode.id, [volume]);
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
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_imminent',
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
        percent_complete: percentage,
        status: 'started',
      });

      mockGetEvents([mockStartedMigrationEvent]).as('getEvents');

      cy.wait('@getEvents');

      cy.findByText(`Migrating (${percentage}%)`).should('be.visible');
    }

    const mockFinishedMigrationEvent = eventFactory.build({
      action: 'volume_migrate',
      entity: { id: volume.id, label: volume.label, type: 'volume' },
      status: 'finished',
    });

    mockGetEvents([mockFinishedMigrationEvent]).as('getEvents');
    mockGetNotifications([]).as('getNotifications');

    cy.wait(['@getEvents', '@getLinodeVolumes', '@getNotifications']);

    mockGetEvents([]);

    cy.findByText('Active').should('be.visible');

    ui.toast.assertMessage(`Volume ${volume.label} has been migrated to NVMe.`);
  });

  it('can upgrade an attached volume from the linode details page', () => {
    const mockRegion = chooseRegion({ capabilities: ['Block Storage'] });
    const linode = linodeFactory.build({
      region: mockRegion.id,
    });
    const volume = volumeFactory.build({
      linode_id: linode.id,
      linode_label: linode.label,
      region: mockRegion.id,
    });

    const migrationScheduledNotification = notificationFactory.build({
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_scheduled',
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
      entity: { id: volume.id, type: 'volume' },
      type: 'volume_migration_imminent',
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
        percent_complete: percentage,
        status: 'started',
      });

      mockGetEvents([mockStartedMigrationEvent]).as('getEvents');

      cy.wait('@getEvents');

      cy.findByText(`Migrating (${percentage}%)`).should('be.visible');
    }

    const mockFinishedMigrationEvent = eventFactory.build({
      action: 'volume_migrate',
      entity: { id: volume.id, label: volume.label, type: 'volume' },
      status: 'finished',
    });

    mockGetEvents([mockFinishedMigrationEvent]).as('getEvents');
    mockGetNotifications([]).as('getNotifications');

    cy.wait(['@getEvents', '@getLinodeVolumes', '@getNotifications']);

    mockGetEvents([]);

    cy.findByText('Active').should('be.visible');

    ui.toast.assertMessage(`Volume ${volume.label} has been migrated to NVMe.`);
  });
});
