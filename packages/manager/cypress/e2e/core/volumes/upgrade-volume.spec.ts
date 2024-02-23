import {
  eventFactory,
  notificationFactory,
  volumeFactory,
} from '@src/factories';
import { mockGetEvents, mockGetNotifications } from 'support/intercepts/events';
import {
  interceptMigrateVolumes,
  mockGetVolumes,
} from 'support/intercepts/volumes';
import { ui } from 'support/ui';

describe('volume upgrade/migration', () => {
  it('can upgrade an unattached to NVMe', () => {
    const volume = volumeFactory.build();

    const migrationScheduledNotification = notificationFactory.build({
      type: 'volume_migration_scheduled',
      entity: { type: 'volume', id: volume.id },
    });

    mockGetVolumes([volume]).as('getVolumes');
    interceptMigrateVolumes().as('migrateVolumes');
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

    const mockStartedMigrationEvent = eventFactory.build({
      action: 'volume_migrate',
      entity: { id: volume.id, type: 'volume' },
      status: 'started',
    });

    mockGetEvents([mockStartedMigrationEvent]).as('getEvents1');

    cy.wait('@getEvents1');

    cy.findByText('migrating').should('be.visible');

    const mockFinishedMigrationEvent = eventFactory.build({
      action: 'volume_migrate',
      entity: { id: volume.id, type: 'volume' },
      status: 'finished',
    });

    mockGetEvents([mockFinishedMigrationEvent]).as('getEvents2');
    mockGetNotifications([]).as('getNotifications');

    cy.wait(['@getEvents2', '@getVolumes', '@getNotifications']);

    cy.findByText('active').should('be.visible');
  });
});
