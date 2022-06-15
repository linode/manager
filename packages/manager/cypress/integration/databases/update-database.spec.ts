/**
 * @file DBaaS integration tests for update operations.
 */

import { regions } from 'support/constants/regions';
import {
  randomLabel,
  randomItem,
  randomNumber,
  randomIp,
  randomString,
} from 'support/util/random';
import { databaseFactory } from 'src/factories/databases';
import { ui } from 'support/ui';
import {
  mockGetDatabase,
  mockGetDatabaseCredentials,
  mockResetPassword,
  mockResetPasswordProvisioningDatabase,
  mockUpdateDatabase,
  mockUpdateProvisioningDatabase,
} from 'support/intercepts/databases';

// @TODO Consider moving this to 'support/constants' or similar.
const databaseTypes = ['mysql', 'postgresql', 'mongodb'];

describe('Update database clusters', () => {
  /*
   * - Tests active database update UI flows using mocked data.
   */
  it('Can update active database clusters', () => {
    const allowedIp = randomIp();
    const engineType = randomItem(databaseTypes);
    const initialPassword = randomString(16);
    const newPassword = randomString(16);
    const database = databaseFactory.build({
      id: randomNumber(1, 1000),
      type: 'g6-nanode-1',
      label: randomLabel(),
      region: randomItem(regions),
      engine: engineType,
      status: 'active',
      allow_list: [allowedIp],
    });

    mockGetDatabase(database).as('getDatabase');
    mockUpdateDatabase(database.id, database.engine).as('updateDatabase');
    mockResetPassword(database.id, database.engine).as('resetRootPassword');
    mockGetDatabaseCredentials(
      database.id,
      database.engine,
      initialPassword
    ).as('getCredentials');

    cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
    cy.wait('@getDatabase');

    cy.get('[data-qa-connection-details]').within(() => {
      // "Show" button should be enabled to reveal password when DB is active.
      cy.findByText('Show')
        .closest('button')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@getCredentials');
      cy.findByText(`= ${initialPassword}`);
    });
  });

  /*
   * - Tests provisioning database update UI flows using mocked data.
   * - Confirms that database update flows work under error conditions.
   * - Confirms that users cannot change access controls for provisioning DBs.
   * - Confirms that users cannot reset root passwords for provisioning DBs.
   * - Confirms that users cannot change maintenance schedules for provisioning DBs.
   */
  it.skip('Cannot update database clusters while they are provisioning', () => {
    const allowedIp = randomIp();
    const engineType = randomItem(databaseTypes);
    const database = databaseFactory.build({
      id: randomNumber(1, 1000),
      type: 'g6-nanode-1',
      label: randomLabel(),
      region: randomItem(regions),
      engine: engineType,
      status: 'provisioning',
      allow_list: [allowedIp],
      hosts: {
        primary: undefined,
        secondary: undefined,
      },
    });

    const errorMessage =
      'Your database is provisioning; please wait until provisioning is complete to perform this operation.';
    const hostnameRegex = /your hostnames? will appear here once (it is|they are) available./i;

    mockGetDatabase(database).as('getDatabase');

    mockUpdateProvisioningDatabase(
      database.id,
      database.engine,
      errorMessage
    ).as('updateDatabase');

    mockResetPasswordProvisioningDatabase(
      database.id,
      database.engine,
      errorMessage
    ).as('resetRootPassword');

    cy.visitWithLogin(`/databases/${database.engine}/${database.id}`);
    cy.wait('@getDatabase');

    cy.get('[data-qa-connection-details]').within(() => {
      // DBaaS hostnames are not available until database/cluster has provisioned.
      cy.findByText(hostnameRegex).should('be.visible');

      // DBaaS passwords cannot be revealed until database/cluster has provisioned.
      cy.findByText('Show')
        .closest('button')
        .should('be.visible')
        .should('be.disabled');
    });

    // Cannot remove allowed IPs before database/cluster has provisioned.
    cy.get('[data-qa-access-controls]').within(() => {
      cy.findByText('Remove').closest('button').click();
    });

    ui.dialog
      .findByTitle(`Remove IP Address ${allowedIp}`)
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Remove IP Address')
          .should('be.visible')
          .click();

        // Cannot remove an IP
        cy.wait('@updateDatabase');
        cy.findByText(errorMessage).should('be.visible');

        ui.buttonGroup.findButtonByTitle('Cancel').should('be.visible').click();
      });

    cy.findByText('Manage Access Controls').closest('button').click();

    ui.drawer
      .findByTitle('Manage Access Controls')
      .should('be.visible')
      .within(() => {
        ui.button.findByTitle('Add an IP').click();

        cy.findByLabelText('Allowed IP Address(es) or Range(s) ip-address-1')
          .click()
          .type(randomIp());

        ui.buttonGroup
          .findButtonByTitle('Update Access Controls')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Cannot add or remove IPs before database/cluster has provisioned.
        cy.wait('@updateDatabase');
        cy.findByText(errorMessage).should('be.visible');

        ui.drawerCloseButton.find().click();
      });

    // Navigate to "Settings" tab.
    ui.tabList.findTabByTitle('Settings').click();

    ui.button
      .findByAttribute('data-qa-settings-button', 'Reset Root Password')
      .should('be.visible')
      .click();

    ui.dialog
      .findByTitle('Reset Root Password')
      .should('be.visible')
      .within(() => {
        ui.buttonGroup
          .findButtonByTitle('Reset Root Password')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Cannot reset root password before database/cluster has provisioned.
        cy.wait('@resetRootPassword');
        cy.findByText(errorMessage).should('be.visible');

        ui.buttonGroup
          .findButtonByTitle('Cancel')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByText('Monthly').should('be.visible').click();

    ui.button
      .findByTitle('Save Changes')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Cannot change maintenance schedule before database/cluster has provisioned.
    cy.findByText(errorMessage).should('be.visible');
  });
});
