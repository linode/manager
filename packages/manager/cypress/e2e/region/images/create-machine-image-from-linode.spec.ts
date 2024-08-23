import type { Disk, Linode } from '@linode/api-v4';
import { createTestLinode } from 'support/util/linodes';
import { createLinodeRequestFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { imageCaptureProcessingTimeout } from 'support/constants/images';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel, randomPhrase, randomString } from 'support/util/random';
import { testRegions } from 'support/util/regions';

authenticate();
describe('Capture Machine Images', () => {
  before(() => {
    cleanUp(['images', 'linodes']);
  });

  /*
   * - Captures a machine image from a Linode in the targeted region.
   * - Confirms that user is redirected to landing page upon image capture.
   * - Confirms that user is shown toast notifications related to the image's status.
   * - Confirms that the image finishes processing successfully.
   */
  testRegions('can capture a Machine Image from a Linode', (region) => {
    const imageLabel = randomLabel();
    const imageDescription = randomPhrase();

    const linodePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      root_pass: randomString(32),
      region: region.id,
      booted: true,
    });

    cy.defer(
      () => createTestLinode(linodePayload, { waitForBoot: true }),
      'creating and booting Linode'
    ).then(([linode, disk]: [Linode, Disk]) => {
      cy.visitWithLogin('/images/create/disk');

      // Select Linode that we just created via the API.
      cy.findByLabelText('Linode').should('be.visible').click();
      ui.autocompletePopper.findByTitle(linode.label).click();

      // Select the Linode's disk.
      cy.contains('Select a Disk').click().type(disk.label);
      ui.autocompletePopper.findByTitle(disk.label).click();

      // Specify a label and description for the captured image, click submit.
      cy.findByLabelText('Label').should('be.visible').click().type(imageLabel);

      cy.findByLabelText('Description')
        .should('be.visible')
        .click()
        .type(imageDescription);

      ui.button
        .findByTitle('Create Image')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Confirm redirect back to landing page and that new image is listed.
      cy.url().should('endWith', '/images');
      ui.toast.assertMessage('Image scheduled for creation.');
      cy.findByText(imageLabel).should('be.visible');

      // Confirm that image capture finishes successfully.
      ui.toast.assertMessage(`Image ${imageLabel} created successfully.`, {
        timeout: imageCaptureProcessingTimeout,
      });

      cy.findByText(imageLabel)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.findByText('Ready').should('be.visible');
        });
    });
  });
});
