import { createStackScript } from '@linode/api-v4/lib';
import { createLinodeRequestFactory, linodeFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import {
  interceptRebuildLinode,
  mockGetLinodeDetails,
  mockRebuildLinodeError,
} from 'support/intercepts/linodes';
import {
  interceptGetStackScript,
  interceptGetStackScripts,
} from 'support/intercepts/stackscripts';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import type { CreateLinodeRequest, Linode } from '@linode/api-v4';

/**
 * Creates a Linode and StackScript.
 *
 * @param stackScriptRequestPayload - StackScript create request payload.
 * @param linodeRequestPayload - Linode create request payload.
 *
 * @returns Promise that resolves when Linode and StackScript are created.
 */
const createStackScriptAndLinode = async (
  stackScriptRequestPayload: any,
  linodeRequestPayload: CreateLinodeRequest
) => {
  return Promise.all([
    createStackScript(stackScriptRequestPayload),
    createTestLinode(linodeRequestPayload),
  ]);
};

/**
 * Opens the Rebuild Linode dialog by selecting it from the Linode's action menu.
 *
 * Assumes that the user has first navigated to the Linode's details page.
 *
 * @param linodeLabel - Label of the Linode being rebuilt.
 */
const openRebuildDialog = (linodeLabel: string) => {
  ui.actionMenu
    .findByTitle(`Action menu for Linode ${linodeLabel}`)
    .should('be.visible')
    .click();

  ui.actionMenuItem.findByTitle('Rebuild').should('be.visible').click();
};

/**
 * Finds the Rebuild Linode dialog.
 *
 * @param linodeLabel - Label of the Linode being rebuilt.
 *
 * @returns Cypress chainable.
 */
const findRebuildDialog = (linodeLabel: string) => {
  return ui.dialog
    .findByTitle(`Rebuild Linode ${linodeLabel}`)
    .should('be.visible');
};

/**
 * Enters a password into the "Root Password" field and confirms it is rated a given strength.
 *
 * @param desiredPassword - Password whose strength should be tested.
 * @param passwordStrength - Expected strength for `desiredPassword`.
 */
const assertPasswordComplexity = (
  desiredPassword: string,
  passwordStrength: 'Fair' | 'Good' | 'Weak'
) => {
  cy.findByLabelText('Root Password').should('be.visible').clear();
  cy.focused().type(desiredPassword);

  cy.contains(`Strength: ${passwordStrength}`).should('be.visible');
};

/**
 * Submits rebuild dialog.
 */
const submitRebuild = () => {
  ui.button
    .findByTitle('Rebuild Linode')
    .scrollIntoView()
    .should('be.visible')
    .should('be.enabled')
    .click();
};

// Error message that is displayed when desired password is not strong enough.
const passwordComplexityError = 'Password does not meet strength requirement.';

authenticate();
describe('rebuild linode', () => {
  const image = 'Alpine 3.18';
  const rootPassword = randomString(16);

  before(() => {
    cleanUp(['lke-clusters', 'linodes', 'stackscripts', 'images']);
  });

  /*
   * - Confirms that Linode can be rebuilt using an image.
   * - Confirms that password complexity
   */
  it('rebuilds a linode from Image', () => {
    cy.tag('method:e2e');
    const weakPassword = 'abc123';
    const fairPassword = 'Akamai123';

    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    cy.defer(
      () => createTestLinode(linodeCreatePayload),
      'creating Linode'
    ).then((linode: Linode) => {
      interceptRebuildLinode(linode.id).as('linodeRebuild');

      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.findByText('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

      openRebuildDialog(linode.label);
      findRebuildDialog(linode.label).within(() => {
        // "From Image" should be selected by default; no need to change the value.
        ui.autocomplete
          .findByLabel('Rebuild From')
          .should('be.visible')
          .should('have.value', 'Image');

        ui.autocomplete.findByLabel('Image').should('be.visible').click();
        ui.autocompletePopper.findByTitle(image).should('be.visible').click();

        // Type to confirm.
        cy.findByLabelText('Linode Label').type(linode.label);

        // checkPasswordComplexity(rootPassword);
        assertPasswordComplexity(weakPassword, 'Weak');
        submitRebuild();
        cy.findByText(passwordComplexityError).should('be.visible');

        assertPasswordComplexity(fairPassword, 'Fair');
        submitRebuild();
        cy.findByText(passwordComplexityError).should('be.visible');

        assertPasswordComplexity(rootPassword, 'Good');
        submitRebuild();
        cy.findByText(passwordComplexityError).should('not.exist');
      });

      cy.wait('@linodeRebuild');
      cy.contains('REBUILDING').should('be.visible');
    });
  });

  /*
   * - Confirms that a Linode can be rebuilt using a Community StackScript.
   */
  it('rebuilds a linode from Community StackScript', () => {
    cy.tag('method:e2e');
    const stackScriptId = 443929;
    const stackScriptName = 'OpenLiteSpeed-WordPress';
    const image = 'AlmaLinux 9';

    const linodeCreatePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    cy.defer(
      () => createTestLinode(linodeCreatePayload),
      'creating Linode'
    ).then((linode: Linode) => {
      interceptRebuildLinode(linode.id).as('linodeRebuild');
      interceptGetStackScripts().as('getStackScripts');
      interceptGetStackScript(stackScriptId).as('getStackScript');
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.findByText('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

      openRebuildDialog(linode.label);
      findRebuildDialog(linode.label).within(() => {
        ui.autocomplete
          .findByLabel('Rebuild From')
          .should('be.visible')
          .click();
        ui.autocompletePopper
          .findByTitle('Community StackScript')
          .should('be.visible')
          .click();

        cy.wait('@getStackScripts');
        cy.findByPlaceholderText('Search StackScripts').scrollIntoView();
        cy.findByPlaceholderText('Search StackScripts')
          .should('be.visible')
          .type(stackScriptName);

        cy.wait('@getStackScripts');

        cy.get(`[id="stackscript-${stackScriptId}"]`).click();

        cy.wait('@getStackScript');

        ui.autocomplete.findByLabel('Image').should('be.visible').click();
        ui.autocompletePopper.findByTitle(image).should('be.visible').click();

        cy.findByLabelText('Linode Label')
          .should('be.visible')
          .type(linode.label);

        assertPasswordComplexity(rootPassword, 'Good');
        submitRebuild();
      });

      cy.wait('@linodeRebuild');
      cy.contains('REBUILDING').should('be.visible');
    });
  });

  /*
   * - Confirms that a Linode can be rebuilt using an Account StackScript.
   */
  it('rebuilds a linode from Account StackScript', () => {
    cy.tag('method:e2e');
    const image = 'Alpine 3.18';
    const region = 'us-east';

    // Create a StackScript to rebuild a Linode.
    const linodeRequest = createLinodeRequestFactory.build({
      image: 'linode/alpine3.18',
      label: randomLabel(),
      region,
      root_pass: randomString(16),
    });

    const stackScriptRequest = {
      deployments_active: 0,
      deployments_total: 0,
      description: randomString(),
      images: ['linode/alpine3.18'],
      is_public: false,
      label: randomLabel(),
      logo_url: '',
      mine: true,
      ordinal: 0,
      rev_note: '',
      script: '#!/bin/bash\n\necho "Hello, world!"',
      user_defined_fields: [],
    };

    cy.defer(
      () => createStackScriptAndLinode(stackScriptRequest, linodeRequest),
      'creating stackScript and linode'
    ).then(([stackScript, linode]) => {
      interceptRebuildLinode(linode.id).as('linodeRebuild');
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.findByText('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
        'be.visible'
      );

      openRebuildDialog(linode.label);
      findRebuildDialog(linode.label).within(() => {
        ui.autocomplete
          .findByLabel('Rebuild From')
          .should('be.visible')
          .click();
        ui.autocompletePopper
          .findByTitle('Account StackScript')
          .should('be.visible')
          .click();

        cy.findByPlaceholderText('Search StackScripts').scrollIntoView();
        cy.findByPlaceholderText('Search StackScripts')
          .should('be.visible')
          .type(`${stackScript.label}`);

        cy.get(`[id="stackscript-${stackScript.id}"]`).click();

        ui.autocomplete.findByLabel('Image').should('be.visible').click();
        ui.autocompletePopper.findByTitle(image).should('be.visible').click();

        cy.findByLabelText('Linode Label')
          .should('be.visible')
          .type(linode.label);

        assertPasswordComplexity(rootPassword, 'Good');
        submitRebuild();
      });

      cy.wait('@linodeRebuild');
      cy.contains('REBUILDING').should('be.visible');
    });
  });

  /*
   * - Confirms UI error flow when attempting to rebuild a Linode that is provisioning.
   * - Confirms that API error message is displayed in the rebuild dialog.
   */
  it('cannot rebuild a provisioning linode', () => {
    const mockLinode = linodeFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
      status: 'provisioning',
    });

    const mockErrorMessage = 'Linode busy.';

    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockRebuildLinodeError(mockLinode.id, mockErrorMessage).as('rebuildLinode');

    cy.visitWithLogin(`/linodes/${mockLinode.id}?rebuild=true`);
    findRebuildDialog(mockLinode.label).within(() => {
      ui.autocomplete.findByLabel('Rebuild From').should('be.visible');
      ui.autocomplete
        .findByLabel('Image')
        .should('be.visible')
        .click()
        .type(image);
      ui.autocompletePopper.findByTitle(image).should('be.visible').click();

      assertPasswordComplexity(rootPassword, 'Good');

      cy.findByLabelText('Linode Label').should('be.visible').click();
      cy.focused().type(mockLinode.label);

      submitRebuild();
      cy.wait('@rebuildLinode');
      cy.findByText(mockErrorMessage);
    });
  });
});
