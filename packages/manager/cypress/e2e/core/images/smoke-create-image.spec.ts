import { eventFactory, linodeFactory } from 'src/factories';
import { linodeDiskFactory } from 'src/factories/disk';
import { imageFactory } from 'src/factories/images';
import { mockGetEvents } from 'support/intercepts/events';
import { mockCreateImage } from 'support/intercepts/images';
import { mockGetLinodeDisks, mockGetLinodes } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { randomLabel, randomNumber, randomPhrase } from 'support/util/random';

describe('create image (using mocks)', () => {
  it('create image from a linode', () => {
    const mockDisks = [
      linodeDiskFactory.build({ label: 'Debian 10 Disk', filesystem: 'ext4' }),
      linodeDiskFactory.build({
        label: '512 MB Swap Image',
        filesystem: 'swap',
      }),
    ];

    const mockLinode = linodeFactory.build();

    const mockNewImage = imageFactory.build({
      id: `private/${randomNumber(1000, 99999)}`,
      label: randomLabel(),
      description: randomPhrase(),
      type: 'manual',
      is_public: false,
      vendor: null,
      expiry: null,
      eol: null,
      status: 'creating',
    });

    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDisks(mockLinode.id, mockDisks).as('getDisks');

    cy.visitWithLogin('/images/create');

    // Wait for Linodes to load
    cy.wait('@getLinodes');

    // Find the Linode select and open it
    cy.findByLabelText('Linode')
      .should('be.visible')
      .should('be.enabled')
      .should('have.attr', 'placeholder', 'Select a Linode')
      .click();

    // Select the Linode
    ui.autocompletePopper
      .findByTitle(mockLinode.label)
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Verify disks load when a Linode is selected
    cy.wait('@getDisks');

    // Find the Disk select and open it
    cy.findByLabelText('Disk')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Select the Linode disk
    ui.autocompletePopper
      .findByTitle(mockDisks[0].label)
      .should('be.visible')
      .click();

    // Give the Image a label
    cy.findByLabelText('Label')
      .should('be.enabled')
      .should('be.visible')
      .type(mockNewImage.label);

    // Give the Image a description
    cy.findByLabelText('Description')
      .should('be.enabled')
      .should('be.visible')
      .type(mockNewImage.description!);

    // Mock the Image creation POST response
    mockCreateImage(mockNewImage).as('createImage');

    // Submit the image create form
    ui.button
      .findByTitle('Create Image')
      .should('be.enabled')
      .should('have.attr', 'type', 'submit')
      .click();

    // Verify the POST /v4/images request happens
    cy.wait('@createImage');

    ui.toast.assertMessage('Image scheduled for creation.');

    // Verify we redirect to the images landing page upon successful creation
    cy.url().should('endWith', 'images');

    mockGetEvents([
      eventFactory.build({ action: 'disk_imagize', status: 'finished' }),
    ]).as('getEvents');

    // Wait for the next events polling request
    cy.wait('@getEvents');

    // Verify a success toast shows
    ui.toast.assertMessage('Image My Config successfully created.');
  });
});
