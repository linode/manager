import {
  grantsFactory,
  linodeFactory,
  profileFactory,
} from '@linode/utilities';
import { mockGetUser } from 'support/intercepts/account';
import { mockGetEvents } from 'support/intercepts/events';
import { mockCreateImage } from 'support/intercepts/images';
import { mockGetLinodeDisks, mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomNumber, randomPhrase } from 'support/util/random';

import { accountUserFactory, eventFactory } from 'src/factories';
import { linodeDiskFactory } from 'src/factories/disk';
import { imageFactory } from 'src/factories/images';

describe('create image (using mocks)', () => {
  it('create image from a linode', () => {
    const mockDisks = [
      linodeDiskFactory.build({ filesystem: 'ext4', label: 'Debian 12 Disk' }),
      linodeDiskFactory.build({
        filesystem: 'swap',
        label: '512 MB Swap Image',
      }),
    ];

    const mockLinode = linodeFactory.build();

    const mockNewImage = imageFactory.build({
      description: randomPhrase(),
      eol: null,
      expiry: null,
      id: `private/${randomNumber(1000, 99999)}`,
      is_public: false,
      label: randomLabel(),
      status: 'creating',
      type: 'manual',
      vendor: null,
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
      .clear();
    cy.focused().type(mockNewImage.label);

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
    ui.toast.assertMessage('Image My Config has been created.');
  });

  it('should not create image for the restricted users', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
    // simulating a default user without the ability to add Linodes.
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_images: false,
      },
    });

    const mockDisks = [
      linodeDiskFactory.build({ filesystem: 'ext4', label: 'Debian 12 Disk' }),
      linodeDiskFactory.build({
        filesystem: 'swap',
        label: '512 MB Swap Image',
      }),
    ];

    const mockLinode = linodeFactory.build();

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);
    mockGetLinodes([mockLinode]).as('getLinodes');
    mockGetLinodeDisks(mockLinode.id, mockDisks).as('getDisks');

    cy.visitWithLogin('/images/create');

    // Wait for Linodes to load
    cy.wait('@getLinodes');

    // Check the following fields are disable

    // Confirm that a notice should be shown informing the user they do not have permission to create a Linode
    cy.findByText(
      "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
    ).should('be.visible');

    // Confirm that "Linode" field is diabled
    cy.get('[data-qa-autocomplete="Linode"]').within(() => {
      cy.get('[title="Open"]').should('be.visible').should('be.disabled');
    });

    // Confirm that "Disk" field is disabled
    cy.get('[data-qa-autocomplete="Disk"]').within(() => {
      cy.get('[title="Open"]').should('be.visible').should('be.disabled');
    });

    // Confirm that "Label" field is disabled
    cy.get('[id="label"]').should('be.visible').should('be.disabled');

    // Confirm that "Add Tags" field is disabled
    cy.get('[data-qa-autocomplete="Add Tags"]').within(() => {
      cy.get('[title="Open"]').should('be.visible').should('be.disabled');
    });

    // Confirm that "Description" field is disabled
    cy.get('[id="description"]').should('be.visible').should('be.disabled');

    // Confirm that "Create Image" button is disabled
    ui.button
      .findByTitle('Create Image')
      .should('be.visible')
      .should('be.disabled');
  });

  it('should not upload image for the restricted users', () => {
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_images: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);

    cy.visitWithLogin('/images/create/upload');

    // Confirm that a notice should be shown informing the user they do not have permission to create a Linode.
    cy.findByText(
      "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
    ).should('be.visible');

    // Check the following fields are disabled

    // Confirm that "Label" field is diabled
    cy.get('[id="label"]').should('be.visible').should('be.disabled');

    // Confirm that "Cloud init compatibility checkbox" field is diabled
    cy.get('[type="checkbox"]').should('be.disabled');

    // Confirm that "Region" field is diabled
    cy.get('[data-qa-autocomplete="Region"]').within(() => {
      cy.get('[title="Open"]').should('be.visible').should('be.disabled');
    });

    // Confirm that "Add Tags" field is disabled
    cy.get('[data-qa-autocomplete="Add Tags"]').within(() => {
      cy.get('[title="Open"]').should('be.visible').should('be.disabled');
    });

    // Confirm that "Description" field is disabled
    cy.get('[id="description"]').should('be.visible').should('be.disabled');

    // Confirm that "Choose File" button is disabled
    ui.button
      .findByTitle('Choose File')
      .should('be.visible')
      .should('be.disabled');

    // Confirm that "Upload Using Command Line" button is disabled
    ui.button
      .findByTitle('Upload Using Command Line')
      .should('be.visible')
      .should('be.disabled');

    // Confirm that "Upload Image" button is disabled
    cy.get('[type="submit"]').should('be.visible').should('be.disabled');
  });
});
