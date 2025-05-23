import { grantsFactory, profileFactory } from '@linode/utilities';
import { accountUserFactory } from '@src/factories/accountUsers';
import { mockGetUser } from 'support/intercepts/account';
import { mockGetAllImages } from 'support/intercepts/images';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

describe('Images empty landing page', () => {
  beforeEach(() => {
    // Mock setup to display the Image landing page in an empty state
    mockGetAllImages([]).as('getImages');
  });

  /*
   * - Confirms Images landing page empty state is shown when no Images are present:
   * - Confirms that "Getting Started Guides" and "Video Playlist" are listed on landing page.
   * - Confirms that clicking "Create Image" navigates user to image create page.
   */
  it('shows the empty state when there are no images', () => {
    cy.visitWithLogin('/images');
    cy.wait(['@getImages']);

    // confirms helper text
    cy.findByText(
      'Store custom Linux images to rapidly deploy compute instances preconfigured with what you need.'
    ).should('be.visible');

    // checks that guides are visible
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Overview of Custom Images').should('be.visible');
    cy.findByText('Getting Started with Custom Images').should('be.visible');
    cy.findByText('Capture an Image from a Linode').should('be.visible');
    cy.findByText('Upload a Custom Image').should('be.visible');
    cy.findByText('View additional Images guides').should('be.visible');

    // checks that videos are visible
    cy.findByText('Video Playlist').should('be.visible');
    cy.findByText(
      'How to use Linode Images | Learn how to Create, Upload, and Deploy Custom Images on Linode'
    ).should('be.visible');
    cy.findByText(
      'Custom Images on Linode | Create, Upload, and Deploy Custom iso Images to Deploy on Linode'
    ).should('be.visible');
    cy.findByText('Using Images and Backups on Linode').should('be.visible');
    cy.findByText('View our YouTube channel').should('be.visible');

    // confirms clicking on 'Create Image' button
    ui.button
      .findByTitle('Create Image')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.url().should('endWith', '/images/create/disk');
  });

  /*
   * - Confirms Images table not exist.
   * - Confirms that "Create Image" button is disabled for restricted user.
   * - Confirms that hovering "Create Image" button shows a Warning for restricted user.
   */
  it('checks restricted user has no access to create Image on Image landing page', () => {
    // object to create a mockProfile for non-restricted user
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    // object to create a mockUser for non-restricted user
    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
    });

    // object to create a mockGrants for non-restricted user
    const mockGrants = grantsFactory.build({
      global: {
        add_images: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);

    // Login and wait for application to load
    cy.visitWithLogin('/images');
    cy.wait('@getImages');
    cy.url().should('endWith', '/images');

    // Assert that List of Images table not exist
    cy.get('table[aria-label="List of Images"]').should('not.exist');

    // confirms 'Create Image' button is disabled
    ui.button
      .findByTitle('Create Image')
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');

    ui.tooltip
      .findByText(
        "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
      )
      .should('be.visible');

    // checks for reference section on empty page
    cy.findByText('Getting Started Guides').should('be.visible');
    cy.findByText('Video Playlist').should('be.visible');
  });
});
