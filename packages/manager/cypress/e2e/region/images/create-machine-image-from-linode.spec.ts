import type { CreateLinodeRequest, Disk, Linode, Region } from '@linode/api-v4';
import { createLinode, getLinodeDisks } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { imageCaptureProcessingTimeout } from 'support/constants/images';
import { ui } from 'support/ui';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { depaginate } from 'support/util/paginate';
import { pollLinodeStatus } from 'support/util/polling';
import { randomLabel, randomPhrase, randomString } from 'support/util/random';
import { describeRegions } from 'support/util/regions';

/**
 * Creates a Linode, waits for it to boot, and returns the Linode and its disk.
 *
 * @param linodePayload - Linode create API request payload.
 *
 * @returns Promise that resolves to a tuple containing the created Linode and its disk.
 */
const createAndBootLinode = async (
  linodePayload: CreateLinodeRequest
): Promise<[Linode, Disk]> => {
  const linode = await createLinode(linodePayload);
  // Wait 25 seconds to begin polling, then poll every 5 seconds until Linode boots.
  await pollLinodeStatus(
    linode.id,
    'running',
    new SimpleBackoffMethod(5000, {
      initialDelay: 25000,
    })
  );
  const disks = await depaginate((page) => getLinodeDisks(linode.id, { page }));
  return [linode, disks[0]];
};

authenticate();
describeRegions('Capture Machine Images', (region: Region) => {
  /*
   * - Captures a machine image from a Linode in the targeted region.
   * - Confirms that user is redirected to landing page upon image capture.
   * - Confirms that user is shown toast notifications related to the image's status.
   * - Confirms that the image finishes processing successfully.
   */
  it('can capture a Machine Image from a Linode', () => {
    const imageLabel = randomLabel();
    const imageDescription = randomPhrase();

    const linodePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      root_pass: randomString(32),
      region: region.id,
    });

    cy.defer(
      createAndBootLinode(linodePayload),
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
