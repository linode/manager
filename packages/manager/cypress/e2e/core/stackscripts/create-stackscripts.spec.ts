import { createImage, getLinodeDisks, resizeLinodeDisk } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import { interceptGetAccountAvailability } from 'support/intercepts/account';
import { interceptGetAllImages } from 'support/intercepts/images';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import {
  interceptCreateStackScript,
  interceptGetStackScripts,
} from 'support/intercepts/stackscripts';
import { ui } from 'support/ui';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import {
  pollImageStatus,
  pollLinodeDiskSize,
  pollLinodeStatus,
} from 'support/util/polling';
import { randomLabel, randomPhrase, randomString } from 'support/util/random';
import { chooseRegion, getRegionByLabel } from 'support/util/regions';

import { getFilteredImagesForImageSelect } from 'src/components/ImageSelect/utilities';

import type { Image } from '@linode/api-v4';

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
 * Sets the StackScript field's value programmatically rather than via simulated typing.
 *
 * Cypress's typing operation is slow for long strings, so we can save several
 * seconds by setting the value directly, then simulating a couple keystrokes.
 *
 * @param script - Script contents to input.
 */
const inputStackScript = (script: string) => {
  cy.get('[data-qa-textfield-label="Script"]').should('be.visible').click();

  cy.focused().invoke('val', script).type(' {backspace}');
};

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
    .click();
  cy.focused().type(label);

  if (description) {
    cy.findByLabelText('Description').should('be.visible').click();
    cy.focused().type(description);
  }

  ui.autocomplete.findByLabel('Target Images').should('be.visible').click();
  ui.autocompletePopper.findByTitle(targetImage).should('be.visible').click();
  ui.autocomplete.findByLabel('Target Images').click(); // Close autocomplete popper

  // Insert a script.
  inputStackScript(script);
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
  const region = getRegionByLabel(regionName);

  ui.regionSelect.find().click();
  ui.regionSelect
    .findItemByRegionLabel(regionName)
    .should('be.visible')
    .click();
  ui.regionSelect.find().should('have.value', `${region.label} (${region.id})`);

  cy.findByText('Linode Label').should('be.visible').click();
  cy.focused().type('{selectall}{backspace}');
  cy.focused().type(label);

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
  // 2GB
  // Shout out to Debian for fitting on a 2GB disk.
  const resizedDiskSize = 2048;
  const linode = await createTestLinode(
    createLinodeRequestFactory.build({
      booted: false,
      label: randomLabel(),
      region: chooseRegion().id,
      root_pass: randomString(32),
      type: 'g6-nanode-1',
    })
  );

  await pollLinodeStatus(linode.id, 'offline', {
    initialDelay: 15000,
  });

  // Resize the disk to speed up Image processing later.
  const diskId = (await getLinodeDisks(linode.id)).data[0].id;
  await resizeLinodeDisk(linode.id, diskId, resizedDiskSize);
  await pollLinodeDiskSize(linode.id, diskId, resizedDiskSize);

  const image = await createImage({
    disk_id: diskId,
    label: randomLabel(),
  });

  await pollImageStatus(
    image.id,
    'available',
    new SimpleBackoffMethod(10000, {
      initialDelay: 45000,
      maxAttempts: 30,
    })
  );

  return image;
};

authenticate();
describe('Create stackscripts', () => {
  before(() => {
    cleanUp(['linodes', 'images', 'stackscripts']);
  });
  beforeEach(() => {
    cy.tag('method:e2e', 'purpose:dcTesting');
  });

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
    const stackscriptImage = 'Alpine 3.19';

    const linodeLabel = randomLabel();
    const linodeRegion = chooseRegion({ capabilities: ['Vlans'] });

    interceptCreateStackScript().as('createStackScript');
    interceptGetStackScripts().as('getStackScripts');
    interceptCreateLinode().as('createLinode');
    interceptGetAccountAvailability().as('getAvailability');

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
      inputStackScript(stackScriptUdfInvalid);
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
      inputStackScript(stackScriptUdf);
    });

    ui.buttonGroup
      .findButtonByTitle('Create StackScript')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createStackScript').then((intercept) => {
      // Confirm the user is redirected to the StackScript details page
      cy.url().should(
        'endWith',
        `/stackscripts/${intercept.response?.body.id}`
      );

      // Confirm a success toast shows
      ui.toast.assertMessage(
        `Successfully created StackScript ${intercept.response?.body.label}`
      );
    });

    ui.button
      .findByTitle('Deploy New Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Wait for availability to be retrieved before interacting with form.
    cy.wait('@getAvailability');

    // Fill out Linode creation form, confirm UDF fields behave as expected.
    fillOutLinodeForm(linodeLabel, linodeRegion.label);

    cy.findByLabelText('Example Password').should('be.visible').click();
    cy.focused().type(randomString(32));

    cy.findByLabelText('Example Title').should('be.visible').click();
    cy.focused().type('{selectall}{backspace}');
    cy.focused().type(randomString(12));

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode');

    // Confirm that Linode has been created and is provisioning.
    cy.findByText(linodeLabel).should('be.visible');

    // In rare cases, the Linode can provision quicker than this assertion happens,
    // so we want to account for cases where it's already booting or even running.
    cy.findByText(/(PROVISIONING|BOOTING|RUNNING)/).should('be.visible');
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

    interceptCreateStackScript().as('createStackScript');
    interceptGetStackScripts().as('getStackScripts');
    interceptCreateLinode().as('createLinode');
    interceptGetAllImages().as('getAllImages');

    cy.defer(createLinodeAndImage, {
      label: 'creating Linode and Image',
      timeout: 360000,
    }).then((privateImage) => {
      cy.visitWithLogin('/stackscripts/create');
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

      // Confirm the user is redirected to the StackScript details page
      cy.wait('@createStackScript').then((intercept) => {
        cy.url().should(
          'endWith',
          `/stackscripts/${intercept.response?.body.id}`
        );
      });

      cy.wait('@getAllImages').then((res) => {
        // Fetch Images from response data and filter out Kubernetes images.
        const imageData = res.response?.body.data;
        const filteredImageData = getFilteredImagesForImageSelect(
          imageData,
          'public'
        );

        ui.button
          .findByTitle('Deploy New Linode')
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm that expected images are present in "Choose an image" drop-down.
        cy.findByPlaceholderText('Choose an image')
          .should('be.visible')
          .click();

        /*
         * Arbitrarily-chosen images to check in order to confirm that "Any/All"
         * StackScripts allow any image to be selected.
         *
         */
        filteredImageData?.forEach((imageSample: Image) => {
          const imageLabel = imageSample.label;
          cy.findAllByText(imageLabel, { exact: false })
            .as('qaImageLabel')
            .last()
            .scrollIntoView();
          cy.get('@qaImageLabel').should('exist').should('be.visible');
        });
      });

      // Select private image.
      cy.findByText(privateImage.label).as('qaPrivateImage').scrollIntoView();
      cy.get('@qaPrivateImage').should('be.visible').click();

      interceptCreateLinode().as('createLinode');
      fillOutLinodeForm(
        linodeLabel,
        chooseRegion({ capabilities: ['Vlans'] }).label
      );
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
