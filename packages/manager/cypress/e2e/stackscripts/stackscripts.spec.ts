import { fbtClick, fbtVisible, getClick, getVisible } from 'support/helpers';
import { regionsFriendly } from 'support/constants/regions';
import {
  randomLabel,
  randomString,
  randomPhrase,
  randomItem,
} from 'support/util/random';
import { ui } from 'support/ui';

const createLinode = () => {
  const password = randomString(32);
  fbtClick('Select a Region');
  fbtClick('Newark, NJ');
  fbtClick('Shared CPU');
  getClick('[id="g6-nanode-1"]');
  getClick('[id="root-password"]').type(password);
  getClick('[data-qa-deploy-linode]');
};

/*
 * StackScript contents which includes an invalid user-defined-field.
 */
const stackScriptWithInvalidUdf = `#!/bin/bash

# <UDF name="invalid-field-name" label="This is invalid" default="" example="" />

echo "Hello, world!"
`;

/*
 * StackScript contents which includes several user-defined-fields.
 */
const stackScriptWithUdf = `#!/bin/bash

# <UDF name="example_password" label="Example Password" default="" example="" />
# <UDF name="example_title" label="Example Title" default="Hello, world!" example="Give it a title!" />

echo "Hello, world!"
`;

// StackScript error that is expected to appear when UDFs with non-alphanumeric names are supplied.
const stackScriptErrorUdfAlphanumeric =
  'UDF names can only contain alphanumeric and underscore characters.';

/**
 * Fills out the StackScript creation form.
 *
 * This assumes that the user is already on the StackScript creation page. This
 * function does not attempt to submit the filled out form.
 *
 * @param label - StackScript label.
 * @param description - StackScript description. Optional.
 * @param targetImage - StackScript target image name.
 * @param script - StackScript contents.
 */
const fillOutStackscriptForm = (
  label: string,
  description: string | undefined,
  targetImage: string,
  script: string
) => {
  // Fill out "StackScript Label", "Description", "Target Images", and "Script" fields.
  cy.findByLabelText('StackScript Label', { exact: false })
    .should('be.visible')
    .click()
    .type(label);

  if (description) {
    cy.findByLabelText('Description')
      .should('be.visible')
      .click()
      .type(description);
  }

  cy.get('[data-qa-multi-select="Select an Image"]')
    .should('be.visible')
    .click()
    .type(`${targetImage}{enter}`);

  // Insert a script with invalid UDF data.
  cy.get('[data-qa-textfield-label="Script"]')
    .should('be.visible')
    .click()
    .type(script);
};

/**
 * Fills out the Linode creation form.
 *
 * This assumes that the user is already on the Linode creation page. This
 * function does not attempt to submit the filled out form.
 *
 * @param label - Linode label.
 * @param region - Linode region.
 */
const fillOutLinodeForm = (label: string, region: string) => {
  const password = randomString(32);

  cy.findByText('Select a Region')
    .should('be.visible')
    .click()
    .type(`${region}{enter}`);

  cy.findByText('Linode Label')
    .should('be.visible')
    .click()
    .type('{selectall}{backspace}')
    .type(label);

  cy.findByText('Dedicated CPU').should('be.visible').click();

  cy.get('[id="g6-dedicated-2"]').click();

  cy.findByLabelText('Root Password').should('be.visible').type(password);
};

describe('stackscripts', () => {
  /*
   * - Creates a StackScript with user-defined fields.
   * - Confirms that an error message appears upon submitting invalid user-defined fields.
   * - Deploys a new Linode using the StackScript.
   * - Confirms that user-defined fields are displayed as expected during Linode creation.
   * - Confirms that Linode created using StackScript boots.
   */
  it('creates a StackScript and deploys a Linode with it', () => {
    const stackscriptLabel = randomLabel();
    const stackscriptDesc = randomPhrase();
    const stackscriptImage = 'Alpine 3.17';
    const stackscriptImageTag = 'alpine3.17';

    const linodeLabel = randomLabel();
    const linodeRegion = randomItem(regionsFriendly);

    cy.visitWithLogin('/stackscripts/create');

    // Submit StackScript creation form with invalid UDF, confirm error message appears.
    fillOutStackscriptForm(
      stackscriptLabel,
      stackscriptDesc,
      stackscriptImage,
      stackScriptWithInvalidUdf
    );

    ui.buttonGroup
      .findButtonByTitle('Create StackScript')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(stackScriptErrorUdfAlphanumeric).should('be.visible');

    // Insert a script with valid UDF data and submit StackScript create form.
    cy.get('[data-qa-textfield-label="Script"]')
      .should('be.visible')
      .click()
      .type('{selectall}{backspace}')
      .type(stackScriptWithUdf);

    ui.buttonGroup
      .findButtonByTitle('Create StackScript')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm the user is redirected to landing page and StackScript is shown.
    cy.url().should('endWith', '/stackscripts/account');

    cy.findByText(stackscriptLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(stackscriptDesc).should('be.visible');
        cy.findByText(stackscriptImageTag).should('be.visible');
      });

    // Navigate to StackScript details page and click deploy Linode button.
    cy.findByText(stackscriptLabel).should('be.visible').click();

    ui.button
      .findByTitle('Deploy New Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Fill out Linode creation form, confirm UDF fields behave as expected.
    fillOutLinodeForm(linodeLabel, linodeRegion);

    cy.findByLabelText('Example Password')
      .should('be.visible')
      .click()
      .type(randomString(32));

    cy.findByLabelText('Example Title')
      .should('be.visible')
      .click()
      .type('{selectall}{backspace}')
      .type(randomString(12));

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByText(linodeLabel).should('be.visible');
    cy.findByText('PROVISIONING').should('be.visible');
    cy.findByText('BOOTING').should('be.visible');
    cy.findByText('RUNNING').should('be.visible');
  });

  it.skip('creates a stackscript with Any/All target image', () => {});

  it.skip('create stackscript, use it to deploy linode', () => {
    const disk = 'Alpine 3.15';
    cy.intercept('POST', `*/linode/instances`).as('createLinode');
    const ssLabel = randomLabel();
    cy.visitWithLogin('/stackscripts');
    cy.url().should('endWith', '/account');
    fbtVisible('Create StackScript').click();
    getClick('[id="stackscript-label"]').type(ssLabel);
    getClick('[data-qa-multi-select="Select an Image"]').type(
      `${disk} {enter}`
    );
    getClick('[data-qa-stackscript-script="true"]').type('#!/bin/bash');
    getClick('[data-qa-save="true"]');
    fbtVisible(ssLabel);
    getVisible(`[data-qa-table-row="${ssLabel}"]`);
    cy.get(`[aria-label="Action menu for StackScript ${ssLabel}"]`)
      .invoke('attr', 'aria-controls')
      .then(($id) => {
        if ($id) {
          getClick(`[aria-label="Action menu for StackScript ${ssLabel}"]`);
        }
        getClick(
          `[id="option-1--${$id}"][data-qa-action-menu-item="Deploy New Linode"]`
        );
      });

    createLinode();
    cy.wait('@createLinode', { timeout: 300000 }).then((linode) => {
      cy.visit(`/linodes/${linode.response?.body.id}/storage`);
      fbtVisible(linode.response?.body.label);
    });
  });
});
