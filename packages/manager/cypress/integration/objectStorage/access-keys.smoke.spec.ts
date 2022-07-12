/**
 * @file Smoke tests for crucial Object Storage Access Keys operations.
 */

import { objectStorageKeyFactory } from 'src/factories/objectStorage';
import {
  mockCreateAccessKey,
  mockDeleteAccessKey,
  mockGetAccessKeys,
} from 'support/intercepts/object-storage';
import { paginateResponse } from 'support/util/paginate';
import { randomLabel, randomNumber } from 'support/util/random';
import { ui } from 'support/ui';

describe('object storage access keys smoke tests', () => {
  /*
   * - Tests core object storage key create flow using mocked API responses.
   * - Creates access key.
   * - Confirms access key and secret are displayed.
   * - Confirms access key is listed in table.
   */
  it('can create access key - smoke', () => {
    const keyLabel = randomLabel();
    const accessKey = '1Yx6kbVF35t15k2CmNQJ';
    const secretKey = 'bN12cDCBbb90meUgwvb0Tu9KWmNyFqMl2MGK1Ol';

    mockGetAccessKeys(paginateResponse([])).as('getKeys');

    mockCreateAccessKey({
      body: objectStorageKeyFactory.build({
        label: keyLabel,
        access_key: accessKey,
        secret_key: secretKey,
      }),
    }).as('createKey');

    cy.visitWithLogin('object-storage/access-keys');
    cy.wait('@getKeys');

    cy.findByText('No items to display.').should('be.visible');

    ui.entityHeader.find().within(() => {
      cy.findByText('Create Access Key').should('be.visible').click();
    });

    mockGetAccessKeys(
      paginateResponse(
        objectStorageKeyFactory.build({
          label: keyLabel,
          access_key: accessKey,
          secret_key: secretKey,
        })
      )
    ).as('getKeys');

    ui.drawer
      .findByTitle('Create Access Key')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Label').click().type(keyLabel);
        ui.buttonGroup
          .findButtonByTitle('Create Access Key')
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
          .should('have.value', accessKey);
        cy.get('input[id="secret-key"]')
          .should('be.visible')
          .should('have.value', secretKey);

        ui.buttonGroup
          .findButtonByTitle('I Have Saved My Keys')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByLabelText('List of Object Storage Access Keys').within(() => {
      cy.findByText(keyLabel).should('be.visible');
      cy.findByText(accessKey).should('be.visible');
    });
  });

  /*
   * - Tests core object storage key revoke flow using mocked API responses.
   * - Confirms access key is listed in table.
   * - Revokes access key.
   * - Confirms access key is no longer listed in table.
   */
  it('can revoke access key - smoke', () => {
    const keyId = randomNumber(1, 99999);
    const keyLabel = randomLabel();
    const accessKey = '1Yx6kbVF35t15k2CmNQJ';
    const secretKey = 'bN12cDCBbb90meUgwvb0Tu9KWmNyFqMl2MGK1Ol';

    // Mock initial GET request to include an access key.
    mockGetAccessKeys(
      paginateResponse(
        objectStorageKeyFactory.build({
          id: keyId,
          label: keyLabel,
          access_key: accessKey,
          secret_key: secretKey,
        })
      )
    ).as('getKeys');

    mockDeleteAccessKey(keyId).as('deleteKey');

    cy.visitWithLogin('/object-storage/access-keys');
    cy.wait('@getKeys');

    cy.findByLabelText('List of Object Storage Access Keys').within(() => {
      cy.findByText(keyLabel).should('be.visible');
      cy.findByText(accessKey).should('be.visible');
      cy.findByText('Revoke').should('be.visible').click();
    });

    // Mock next GET request to respond with no data to reflect key revocation.
    mockGetAccessKeys(paginateResponse([])).as('getKeys');

    ui.dialog.findByTitle(`Revoking ${keyLabel}`).within(() => {
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
