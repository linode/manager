import { ui } from 'support/ui';
import { mockGetAllImages } from 'support/intercepts/images';

describe('Images empty landing page', () => {
  /**
   * - Confirms Images landing page empty state is shown when no Images are present:
   * - Confirms that "Getting Started Guides" and "Video Playlist" are listed on landing page.
   * - Confirms that clicking "Create Image" navigates user to image create page.
   */
  it('shows the empty state when there are no images', () => {
    mockGetAllImages([]).as('getImages');

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
});
