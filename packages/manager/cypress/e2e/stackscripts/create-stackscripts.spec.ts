import { authenticate } from 'support/api/authentication';
import { pollLinodeStatus, pollImageStatus } from 'support/util/polling';
import {
  randomLabel,
  randomString,
  randomPhrase,
  randomItem,
} from 'support/util/random';
import {
  interceptCreateStackScript,
  interceptGetStackScripts,
} from 'support/intercepts/stackscripts';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { createLinodeRequestFactory } from 'src/factories';
import { createLinode, getLinodeDisks } from '@linode/api-v4/lib/linodes';
import { createImage } from '@linode/api-v4/lib/images';
import { chooseRegion } from 'support/util/regions';

// StackScript fixture paths.
const stackscriptBasicPath = 'stackscripts/stackscript-basic.sh';
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
  cy.findByLabelText(/^StackScript Label.*/)
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
 * @param regionName - Linode region name.
 */
const fillOutLinodeForm = (label: string, regionName: string) => {
  const password = randomString(32);

  cy.findByText('Select a Region').should('be.visible').click();

  ui.regionSelect.findItemByRegionName(regionName).click();

  cy.findByText('Linode Label')
    .should('be.visible')
    .click()
    .type('{selectall}{backspace}')
    .type(label);

  cy.findByText('Dedicated CPU').should('be.visible').click();
  cy.get('[id="g6-dedicated-2"]').click();
  cy.findByLabelText('Root Password').should('be.visible').type(password);
};

/**
 * Creates a private image from a Linode.
 *
 * This can take a few minutes since we have to wait for the Linode to
 * boot and then wait for the private image to be processed.
 *
 * @returns Promise that resolves to the new Image.
 */
const createLinodeAndImage = async () => {
  const linode = await createLinode(
    createLinodeRequestFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
      root_pass: randomString(32),
    })
  );

  await pollLinodeStatus(linode.id, 'running', {
    initialDelay: 15000,
  });

  const diskId = (await getLinodeDisks(linode.id)).data[0].id;
  const image = await createImage(diskId, randomLabel(), randomPhrase());

  await pollImageStatus(image.id, 'available', {
    initialDelay: 60000,
    maxAttempts: 15,
  });

  return image;
};

authenticate();
describe('stackscripts', () => {
  /*
   * - Creates a StackScript with user-defined fields.
   * - Confirms that an error message appears upon submitting script without a shebang.
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
    const linodeRegion = chooseRegion();

    interceptCreateStackScript().as('createStackScript');
    interceptGetStackScripts().as('getStackScripts');
    interceptCreateLinode().as('createLinode');

    cy.visitWithLogin('/stackscripts/create');

    // Submit StackScript creation form with invalid contents, confirm error messages.
    cy.fixture(stackscriptNoShebangPath).then((stackscriptWithNoShebang) => {
      fillOutStackscriptForm(
        stackscriptLabel,
        stackscriptDesc,
        stackscriptImage,
        stackscriptWithNoShebang
      );
    });

    ui.buttonGroup
      .findButtonByTitle('Create StackScript')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createStackScript');
    cy.findByText(stackScriptErrorNoShebang).should('be.visible');

    cy.fixture(stackscriptUdfInvalidPath).then((stackScriptUdfInvalid) => {
      cy.get('[data-qa-textfield-label="Script"]')
        .should('be.visible')
        .click()
        .type('{selectall}{backspace}')
        .type(stackScriptUdfInvalid);
    });

    ui.buttonGroup
      .findButtonByTitle('Create StackScript')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createStackScript');
    cy.findByText(stackScriptErrorUdfAlphanumeric).should('be.visible');

    // Insert a script with valid UDF data and submit StackScript create form.
    cy.fixture(stackscriptUdfPath).then((stackScriptUdf) => {
      cy.get('[data-qa-textfield-label="Script"]')
        .should('be.visible')
        .click()
        .type('{selectall}{backspace}')
        .type(stackScriptUdf);
    });

    ui.buttonGroup
      .findButtonByTitle('Create StackScript')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Confirm the user is redirected to landing page and StackScript is shown.
    cy.wait('@createStackScript');
    cy.url().should('endWith', '/stackscripts/account');
    cy.wait('@getStackScripts');

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
    fillOutLinodeForm(linodeLabel, linodeRegion.name);

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

    cy.wait('@createLinode');

    // Confirm that Linode has been created and is provisioning.
    cy.findByText(linodeLabel).should('be.visible');
    cy.findByText('PROVISIONING').should('be.visible');
  });

  /*
   * - Creates a StackScript with "Any/All" image.
   * - Confirms that any default image can be selected when deploying with "Any/All" StackScripts.
   * - Confirms that private images can be selected when deploying with "Any/All" StackScripts.
   * - Confirms that a Linode can be deployed using StackScript with private image.
   */
  it('creates a StackScript with Any/All target image', () => {
    const stackscriptLabel = randomLabel();
    const stackscriptDesc = randomPhrase();
    const stackscriptImage = 'Any/All';

    const linodeLabel = randomLabel();

    /*
     * Arbitrarily-chosen images to check in order to confirm that "Any/All"
     * StackScripts allow any image to be selected.
     */
    const imageSamples = [
      { label: 'AlmaLinux 9', sel: 'linode/almalinux9' },
      { label: 'Alpine 3.17', sel: 'linode/alpine3.17' },
      { label: 'Arch Linux', sel: 'linode/arch' },
      { label: 'CentOS Stream 9', sel: 'linode/centos-stream9' },
      { label: 'Debian 11', sel: 'linode/debian11' },
      { label: 'Fedora 37', sel: 'linode/fedora37' },
      { label: 'Rocky Linux 9', sel: 'linode/rocky9' },
      { label: 'Ubuntu 22.10', sel: 'linode/ubuntu22.10' },
    ];

    interceptCreateStackScript().as('createStackScript');
    interceptGetStackScripts().as('getStackScripts');
    interceptCreateLinode().as('createLinode');

    cy.visitWithLogin('/stackscripts/create');
    cy.defer(createLinodeAndImage()).then((privateImage) => {
      cy.fixture(stackscriptBasicPath).then((stackscriptBasic) => {
        fillOutStackscriptForm(
          stackscriptLabel,
          stackscriptDesc,
          stackscriptImage,
          stackscriptBasic
        );
      });

      ui.buttonGroup
        .findButtonByTitle('Create StackScript')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@createStackScript');
      cy.url().should('endWith', '/stackscripts/account');

      cy.wait('@getStackScripts');
      cy.findByText(stackscriptLabel)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText(stackscriptDesc).should('be.visible');
          cy.findByText(stackscriptImage).should('be.visible');
        });

      // Navigate to StackScript details page and click deploy Linode button.
      cy.findByText(stackscriptLabel).should('be.visible').click();

      ui.button
        .findByTitle('Deploy New Linode')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Confirm that expected images are present in "Choose an image" drop-down.
      cy.findByText('Choose an image').should('be.visible').click();

      imageSamples.forEach((imageSample) => {
        const imageLabel = imageSample.label;
        const imageSelector = imageSample.sel;

        cy.get(`[data-qa-image-select-item="${imageSelector}"]`)
          .scrollIntoView()
          .should('be.visible')
          .within(() => {
            cy.findByText(imageLabel).should('be.visible');
          });
      });

      // Select private image.
      cy.get(`[data-qa-image-select-item="${privateImage.id}"]`)
        .scrollIntoView()
        .should('be.visible')
        .click();

      interceptCreateLinode().as('createLinode');
      fillOutLinodeForm(linodeLabel, chooseRegion().name);
      ui.button
        .findByTitle('Create Linode')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@createLinode');
      cy.findByText(linodeLabel).should('be.visible');
      cy.findByText('PROVISIONING').should('be.visible');
    });
  });
});
