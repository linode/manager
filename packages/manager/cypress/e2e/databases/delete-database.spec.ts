/**
 * @file DBaaS integration tests for delete operations.
 */

import { regions } from 'support/constants/regions';
import { databaseFactory } from 'src/factories/databases';
import {
  randomLabel,
  randomItem,
  randomNumber,
  randomIp,
} from 'support/util/random';
import {
  mockDeleteDatabase,
  mockDeleteProvisioningDatabase,
  mockGetDatabase,
} from 'support/intercepts/databases';
import { ui } from 'support/ui';
import { assertToast } from 'support/ui/events';

describe('Delete database clusters', () => {
  /*
   * - Tests database deletion UI flow using mocked data.
   * - Confirms that database deletion flow can be completed.
   * - Confirms that user is redirected to database landing page upon completion.
   */
  it('Can delete active database clusters', () => {
    const allowedIp = randomIp();
    const database = databaseFactory.build({
      id: randomNumber(1, 1000),
      type: 'g6-nanode-1',
      label: randomLabel(),
      region: randomItem(regions),
      engine: 'mysql',
      status: 'active',
      allow_list: [allowedIp],
    });

    mockGetDatabase(database).as('getDatabase');
    mockDeleteDatabase(database.id, database.engine).as('deleteDatabase');

    cy.visitWithLogin(`/databases/${database.engine}/${database.id}/settings`);
    cy.wait('@getDatabase');

    // Click "Delete Cluster" button.
    ui.button
      .findByAttribute('data-qa-settings-button', 'Delete Cluster')
      .should('be.visible')
      .click();

    // Fill out type-to-confirm, click "Delete Cluster" button, confirm error.
    ui.dialog
      .findByTitle(`Delete Database Cluster ${database.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Cluster Name').click().type(database.label);

        ui.buttonGroup
          .findButtonByTitle('Delete Cluster')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@deleteDatabase');
      });

    cy.url().should('endWith', '/databases');
    assertToast('Database Cluster deleted successfully.');
  });

  /*
   * - Tests provisioning database deletion UI flow using mocked data.
   * - Confirms that error is shown to user upon deletion attempt.
   */
  it('Cannot delete provisioning database clusters', () => {
    const database = databaseFactory.build({
      id: randomNumber(1, 1000),
      type: 'g6-nanode-1',
      label: randomLabel(),
      region: randomItem(regions),
      engine: 'mysql',
      status: 'provisioning',
      allow_list: [],
      hosts: {
        primary: undefined,
        secondary: undefined,
      },
    });

    const errorMessage =
      'Your database is provisioning; please wait until provisioning is complete to perform this operation.';

    mockGetDatabase(database).as('getDatabase');
    mockDeleteProvisioningDatabase(
      database.id,
      database.engine,
      errorMessage
    ).as('deleteDatabase');

    cy.visitWithLogin(`/databases/${database.engine}/${database.id}/settings`);
    cy.wait('@getDatabase');

    // Click "Delete Cluster" button.
    ui.button
      .findByAttribute('data-qa-settings-button', 'Delete Cluster')
      .should('be.visible')
      .click();

    // Fill out type-to-confirm, click "Delete Cluster" button, confirm error.
    ui.dialog
      .findByTitle(`Delete Database Cluster ${database.label}`)
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Cluster Name').click().type(database.label);

        ui.buttonGroup
          .findButtonByTitle('Delete Cluster')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.wait('@deleteDatabase');
        cy.findByText(errorMessage).should('be.visible');
      });
  });
});
