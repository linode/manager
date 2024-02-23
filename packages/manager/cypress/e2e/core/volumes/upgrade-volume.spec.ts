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
      entity: { id: volume.id, type: 'volume' },
      status: 'finished',
    });

    mockGetEvents([mockFinishedMigrationEvent]).as('getEvents');
    mockGetNotifications([]).as('getNotifications');

    cy.wait(['@getEvents', '@getVolumes', '@getNotifications']);

    cy.findByText('active').should('be.visible');
  });
});
