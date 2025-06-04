/**
 * @file Smoke tests for crucial Object Storage Access Keys operations.
 */

import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateAccessKey,
  mockDeleteAccessKey,
  mockGetAccessKeys,
} from 'support/intercepts/object-storage';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';

import { accountFactory } from 'src/factories';
import { objectStorageKeyFactory } from 'src/factories/objectStorage';

describe('object storage access keys smoke tests', () => {
  /*
   * - Tests core object storage key create flow using mocked API responses.
   * - Creates access key.
   * - Confirms access key and secret are displayed.
   * - Confirms access key is listed in table.
   */
  it('can create access key - smoke', () => {
    const mockAccessKey = objectStorageKeyFactory.build({
      label: randomLabel(),
    });

    mockGetAccount(accountFactory.build({ capabilities: ['Object Storage'] }));
    mockAppendFeatureFlags({
      objMultiCluster: false,
      objectStorageGen2: { enabled: false },
    });

    mockGetAccessKeys([]).as('getKeys');
    mockCreateAccessKey(mockAccessKey).as('createKey');

    cy.visitWithLogin('object-storage/access-keys');
    cy.wait('@getKeys');

    cy.findByText('No items to display.').should('be.visible');

    ui.entityHeader.find().within(() => {
      cy.findByText('Create Access Key').should('be.visible').click();
    });

    mockGetAccessKeys([mockAccessKey]).as('getKeys');
    ui.drawer
      .findByTitle('Create Access Key')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label').click();
        cy.focused().type(mockAccessKey.label);
        ui.buttonGroup
          .findButtonByTitle('Create Access Key')
          .as('qaCreateAccessKey')
          .scrollIntoView();
        cy.get('@qaCreateAccessKey')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait(['@createKey', '@getKeys']);

    ui.dialog
      .findByTitle('Access Keys')
      .should('be.visible')
      .within(() => {
        cy.get('input[id="access-key"]')
          .should('be.visible')
          .should('have.value', mockAccessKey.access_key);
        cy.get('input[id="secret-key"]')
          .should('be.visible')
          .should('have.value', mockAccessKey.secret_key);

        ui.buttonGroup
          .findButtonByTitle('I Have Saved My Secret Key')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByLabelText('List of Object Storage Access Keys').within(() => {
      cy.findByText(mockAccessKey.label).should('be.visible');
      cy.findByText(mockAccessKey.access_key).should('be.visible');
    });
  });

  /*
   * - Tests core object storage key revoke flow using mocked API responses.
   * - Confirms access key is listed in table.
   * - Revokes access key.
   * - Confirms access key is no longer listed in table.
   */
  it('can revoke access key - smoke', () => {
    const accessKey = objectStorageKeyFactory.build({
      id: randomNumber(1, 99999),
      label: randomLabel(),
    });

    mockGetAccount(accountFactory.build({ capabilities: ['Object Storage'] }));
    mockAppendFeatureFlags({
      objMultiCluster: false,
      objectStorageGen2: { enabled: false },
    });

    // Mock initial GET request to include an access key.
    mockGetAccessKeys([accessKey]).as('getKeys');
    mockDeleteAccessKey(accessKey.id).as('deleteKey');

    cy.visitWithLogin('/object-storage/access-keys');
    cy.wait('@getKeys');

    cy.findByLabelText('List of Object Storage Access Keys').within(() => {
      cy.findByText(accessKey.label).should('be.visible');
      cy.findByText(accessKey.access_key).should('be.visible');
      cy.findByText('Revoke').should('be.visible').click();
    });

    // Mock next GET request to respond with no data to reflect key revocation.
    mockGetAccessKeys([]).as('getKeys');

    ui.dialog.findByTitle(`Revoking ${accessKey.label}`).within(() => {
      ui.buttonGroup
        .findButtonByTitle('Revoke')
        .should('be.visible')
        .should('be.enabled')
        .click();
    });

    cy.wait(['@deleteKey', '@getKeys']);
    cy.findByText('No items to display.').should('be.visible');
  });
});
