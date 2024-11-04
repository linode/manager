import { authenticate } from 'support/api/authentication';
import { randomLabel, randomPhrase } from 'support/util/random';
import {
  mockGetStackScript,
  mockUpdateStackScript,
  mockUpdateStackScriptError,
  mockGetStackScripts,
} from 'support/intercepts/stackscripts';
import { ui } from 'support/ui';
import { stackScriptFactory } from '@src/factories';
import { StackScript } from '@linode/api-v4';

// StackScript fixture paths.
const stackscriptNoShebangPath = 'stackscripts/stackscript-no-shebang.sh';
const stackscriptUdfPath = 'stackscripts/stackscript-udf.sh';
const stackscriptUdfInvalidPath = 'stackscripts/stackscript-udf-invalid.sh';

// StackScript error that is expected to appear when script is missing a shebang.
const stackScriptErrorNoShebang =
  "Script must begin with a shebang (example: '#!/bin/bash').";

// StackScript error that is expected to appear when UDFs with non-alphanumeric names are supplied.
const stackScriptErrorUdfAlphanumeric =
  'UDF names can only contain alphanumeric and underscore characters.';

/**
 * Fills out the StackScript edition form.
 *
 * This assumes that the user is already on the StackScript edition page. This
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
  cy.findByLabelText(/^StackScript Label.*/)
    .should('be.visible')
    .click()
    .clear()
    .type(label);

  if (description) {
    cy.findByLabelText('Description')
      .should('be.visible')
      .click()
      .clear()
      .type(description);
  }

  ui.autocomplete.findByLabel('Target Images').should('be.visible').click();
  ui.autocompletePopper.findByTitle(targetImage).should('be.visible').click();
  ui.autocomplete.findByLabel('Target Images').click(); // Close autocomplete popper

  // Insert a script with invalid UDF data.
  cy.get('[data-qa-textfield-label="Script"]')
    .should('be.visible')
    .click()
    .type(script);
};

authenticate();
describe('Update stackscripts', () => {
  /*
   * - Updates a StackScript with user-defined fields.
   * - Confirms that an error message appears upon submitting script without a shebang.
   * - Confirms that an error message appears upon submitting invalid user-defined fields.
   * - Confirms that the StackScript is updated successfully.
   */
  it('updates a StackScript', () => {
    const stackscriptLabel = randomLabel();
    const stackscriptDesc = randomPhrase();
    const stackscriptImage = 'Alpine 3.17';

    const stackScripts = stackScriptFactory.buildList(2);
    // Import StackScript type from Linode API package.
    const updatedStackScripts: StackScript[] = [
      // Spread operator clones an object...
      {
        ...stackScripts[0],
        label: stackscriptLabel,
        description: stackscriptDesc,
      },
      { ...stackScripts[1] },
    ];
    mockGetStackScripts(stackScripts).as('getStackScripts');
    cy.visitWithLogin('/stackscripts/account');
    cy.wait('@getStackScripts');

    cy.get(`[data-qa-table-row="${stackScripts[0].label}"]`).within(() => {
      ui.actionMenu
        .findByTitle(`Action menu for StackScript ${stackScripts[0].label}`)
        .should('be.visible')
        .click();
    });
    mockGetStackScript(stackScripts[0].id, stackScripts[0]).as(
      'getStackScript'
    );
    ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();
    cy.wait('@getStackScript');
    cy.url().should('endWith', `/stackscripts/${stackScripts[0].id}/edit`);

    ui.buttonGroup
      .findButtonByTitle('Save Changes')
      .should('be.visible')
      .should('be.disabled');

    // Submit StackScript edit form with invalid contents, confirm error messages.
    cy.fixture(stackscriptNoShebangPath).then((stackscriptWithNoShebang) => {
      fillOutStackscriptForm(
        stackscriptLabel,
        stackscriptDesc,
        stackscriptImage,
        stackscriptWithNoShebang
      );
    });

    mockUpdateStackScriptError(
      stackScripts[0].id,
      'script',
      stackScriptErrorNoShebang
    ).as('updateStackScript');
    ui.buttonGroup
      .findButtonByTitle('Save Changes')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@updateStackScript');
    cy.findByText(stackScriptErrorNoShebang).should('be.visible');

    // Insert a script with valid UDF data and submit StackScript edit form.
    cy.fixture(stackscriptUdfInvalidPath).then((stackScriptUdfInvalid) => {
      cy.get('[data-qa-textfield-label="Script"]')
        .should('be.visible')
        .click()
        .type('{selectall}{backspace}')
        .type(stackScriptUdfInvalid);
    });

    mockUpdateStackScriptError(
      stackScripts[0].id,
      'script',
      stackScriptErrorUdfAlphanumeric
    ).as('updateStackScript');
    ui.buttonGroup
      .findButtonByTitle('Save Changes')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@updateStackScript');
    cy.findByText(stackScriptErrorUdfAlphanumeric).should('be.visible');

    // Insert a script with valid UDF data and submit StackScript edit form.
    cy.fixture(stackscriptUdfPath).then((stackScriptUdf) => {
      cy.get('[data-qa-textfield-label="Script"]')
        .should('be.visible')
        .click()
        .type('{selectall}{backspace}')
        .type(stackScriptUdf);
    });

    updatedStackScripts[0].label = stackscriptLabel;
    updatedStackScripts[0].description = stackscriptDesc;
    mockGetStackScripts(updatedStackScripts).as('getStackScripts');
    mockUpdateStackScript(updatedStackScripts[0].id, updatedStackScripts[0]).as(
      'updateStackScript'
    );
    ui.buttonGroup
      .findButtonByTitle('Save Changes')
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@updateStackScript');
    cy.url().should('endWith', '/stackscripts/account');
    cy.wait('@getStackScripts');

    cy.findByText(stackscriptLabel)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(stackscriptDesc).should('be.visible');
      });
  });

  /*
   * - Updates a StackScript to public.
   * - Confirms that the StackScript is updated to public successfully.
   */
  it('makes a StackScript public', () => {
    const stackScripts = stackScriptFactory.buildList(2, {
      is_public: false,
    });
    mockGetStackScripts(stackScripts).as('getStackScripts');
    cy.visitWithLogin('/stackscripts/account');
    cy.wait('@getStackScripts');

    // Do nothing when cancelling
    cy.get(`[data-qa-table-row="${stackScripts[0].label}"]`).within(() => {
      ui.actionMenu
        .findByTitle(`Action menu for StackScript ${stackScripts[0].label}`)
        .should('be.visible')
        .click();
    });
    ui.actionMenuItem
      .findByTitle('Make StackScript Public')
      .should('be.visible')
      .click();
    ui.dialog
      .findByTitle('Woah, just a word of caution...')
      .should('be.visible')
      .within(() => {
        ui.button.findByTitle('Cancel').should('be.visible').click();
      });

    cy.findByText(stackScripts[0].label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(stackScripts[0].description).should('be.visible');
        cy.findByText('Public').should('not.exist');
        cy.findByText('Private').should('be.visible');
      });

    // The status of the StackScript will become public
    cy.get(`[data-qa-table-row="${stackScripts[0].label}"]`).within(() => {
      ui.actionMenu
        .findByTitle(`Action menu for StackScript ${stackScripts[0].label}`)
        .should('be.visible')
        .click();
    });
    ui.actionMenuItem
      .findByTitle('Make StackScript Public')
      .should('be.visible')
      .click();
    const updatedStackScript = { ...stackScripts[0] };
    updatedStackScript.is_public = true;
    mockUpdateStackScript(updatedStackScript.id, updatedStackScript).as(
      'mockUpdateStackScript'
    );
    mockGetStackScripts([updatedStackScript, stackScripts[1]]).as(
      'mockGetStackScripts'
    );
    ui.dialog
      .findByTitle('Woah, just a word of caution...')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Yes, make me a star!')
          .should('be.visible')
          .click();
      });
    cy.wait('@mockUpdateStackScript');
    cy.wait('@mockGetStackScripts');

    cy.findByText(stackScripts[0].label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText(stackScripts[0].description).should('be.visible');
        cy.findByText('Private').should('not.exist');
        cy.findByText('Public').should('be.visible');
      });
  });
});
