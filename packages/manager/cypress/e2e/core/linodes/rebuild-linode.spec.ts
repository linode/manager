import { CreateLinodeRequest, Linode } from '@linode/api-v4';
import { ui } from 'support/ui';
import { randomString, randomLabel } from 'support/util/random';
import { authenticate } from 'support/api/authentication';
import { createStackScript } from '@linode/api-v4/lib';
import { interceptGetStackScripts } from 'support/intercepts/stackscripts';
import { createLinodeRequestFactory, linodeFactory } from '@src/factories';
import { cleanUp } from 'support/util/cleanup';
import { chooseRegion } from 'support/util/regions';
import {
  interceptRebuildLinode,
  mockGetLinodeDetails,
  mockRebuildLinodeError,
} from 'support/intercepts/linodes';
import { createTestLinode } from 'support/util/linodes';

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
  passwordStrength: 'Weak' | 'Fair' | 'Good'
) => {
  cy.findByLabelText('Root Password')
    .should('be.visible')
    .clear()
    .type(desiredPassword);

  cy.contains(`Strength: ${passwordStrength}`).should('be.visible');
};

/**
 * Submits rebuild dialog.
 */
const submitRebuild = () => {
  ui.button
    .findByTitle('Rebuild Linode')
    .scrollIntoView()
    .should('have.attr', 'data-qa-form-data-loading', 'false')
    .should('be.visible')
    .should('be.enabled')
    .click();
};

// Error message that is displayed when desired password is not strong enough.
const passwordComplexityError =
  'Password does not meet complexity requirements.';

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
      cy.findByText('RUNNING').should('be.visible');

      openRebuildDialog(linode.label);
      findRebuildDialog(linode.label).within(() => {
        // "From Image" should be selected by default; no need to change the value.
        ui.autocomplete
          .findByLabel('From Image')
          .should('be.visible')
          .should('have.value', 'From Image');

        ui.autocomplete.findByLabel('Images').should('be.visible').click();
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
    const stackScriptId = '443929';
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
      cy.visitWithLogin(`/linodes/${linode.id}`);
      cy.findByText('RUNNING').should('be.visible');

      openRebuildDialog(linode.label);
      findRebuildDialog(linode.label).within(() => {
        ui.autocomplete.findByLabel('From Image').should('be.visible').click();
        ui.autocompletePopper
          .findByTitle('From Community StackScript')
          .should('be.visible')
          .click();

        cy.wait('@getStackScripts');
        cy.findByLabelText('Search by Label, Username, or Description')
          .should('be.visible')
          .type(`${stackScriptName}`);

        cy.wait('@getStackScripts');
        cy.findByLabelText('List of StackScripts').within(() => {
          cy.get(`[id="${stackScriptId}"][type="radio"]`).click();
        });

        ui.autocomplete.findByLabel('Images').should('be.visible').click();
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
      label: randomLabel(),
      region: region,
      image: 'linode/alpine3.18',
      root_pass: randomString(16),
    });

    const stackScriptRequest = {
      label: randomLabel(),
      description: randomString(),
      ordinal: 0,
      logo_url: '',
      images: ['linode/alpine3.18'],
      deployments_total: 0,
      deployments_active: 0,
      is_public: false,
      mine: true,
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
      cy.findByText('RUNNING').should('be.visible');

      openRebuildDialog(linode.label);
      findRebuildDialog(linode.label).within(() => {
        ui.autocomplete.findByLabel('From Image').should('be.visible').click();
        ui.autocompletePopper
          .findByTitle('From Account StackScript')
          .should('be.visible')
          .click();

        cy.findByLabelText('Search by Label, Username, or Description')
          .should('be.visible')
          .type(`${stackScript.label}`);

        cy.findByLabelText('List of StackScripts').within(() => {
          cy.get(`[id="${stackScript.id}"][type="radio"]`).click();
        });

        ui.autocomplete.findByLabel('Images').should('be.visible').click();
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
  it.only('cannot rebuild a provisioning linode', () => {
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
      ui.autocomplete.findByLabel('From Image').should('be.visible');
      ui.autocomplete.findByLabel('Images').should('be.visible').click().type(image);
      ui.autocompletePopper.findByTitle(image).should('be.visible').click();

      assertPasswordComplexity(rootPassword, 'Good');

      cy.findByLabelText('Linode Label')
        .should('be.visible')
        .click()
        .type(mockLinode.label);

      submitRebuild();
      cy.wait('@rebuildLinode');
      cy.findByText(mockErrorMessage);
    });
  });
});
