import { profileFactory } from '@linode/utilities';
import { mockGetUser } from 'support/intercepts/account';
import { mockGetAllImages } from 'support/intercepts/images';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

import { imageFactory } from 'src/factories';
import { grantsFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories';

import type { Image } from '@linode/api-v4';

function checkActionMenu(tableAlias: string, mockImages: any[]) {
  mockImages.forEach((image) => {
    cy.get(tableAlias)
      .find('tbody tr')
      .should('contain', image.label)
      .then(($row) => {
        // If the row contains the label, proceed with clicking the action menu
        const actionButton = $row.find(
          `button[aria-label="Action menu for Image ${image.label}"]`
        );
        if (actionButton) {
          cy.wrap(actionButton).click();

          // Check that the item with text 'Deploy to New Linode' is active
          cy.get('ul[role="menu"]')
            .contains('Deploy to New Linode')
            .should('be.visible')
            .and('be.enabled');

          // Check that all other items are disabled
          cy.get('ul[role="menu"]')
            .find('li')
            .not(':contains("Deploy to New Linode")')
            .each(($li) => {
              cy.wrap($li).should('be.visible').and('be.disabled');
            });

          // Close the action menu by clicking on Custom Image Title of the screen
          cy.get('body').click(0, 0);
        }
      });
  });
}

describe('image landing checks for non-empty state with restricted user', () => {
  beforeEach(() => {
    const mockImages: Image[] = new Array(3).fill(null).map(
      (_item: null, index: number): Image => {
        return imageFactory.build({
          label: `Image ${index}`,
          tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
        });
      }
    );

    // Mock setup to display the Image landing page in an non-empty state
    mockGetAllImages(mockImages).as('getImages');

    // Alias the mockImages array
    cy.wrap(mockImages).as('mockImages');
  });

  it('checks restricted user with read access has no access to create image and can see existing images', () => {
    // Mock setup for user profile, account user, and user grants with restricted permissions,
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

    // Login and wait for application to load
    cy.visitWithLogin('/images');
    cy.wait('@getImages');
    cy.url().should('endWith', '/images');

    cy.contains('h3', 'Custom Images')
      .closest('div[data-qa-paper="true"]')
      .find('[role="table"]')
      .should('exist')
      .as('customImageTable');

    cy.contains('h3', 'Recovery Images')
      .closest('div[data-qa-paper="true"]')
      .find('[role="table"]')
      .should('exist')
      .as('recoveryImageTable');

    // Assert that Create Image button is visible and disabled
    ui.button
      .findByTitle('Create Image')
      .should('be.visible')
      .and('be.disabled')
      .trigger('mouseover');

    // Assert that tooltip is visible with message
    ui.tooltip
      .findByText(
        "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
      )
      .should('be.visible');

    cy.get<Image[]>('@mockImages').then((mockImages) => {
      // Assert that the correct number of Image entries are present in the customImageTable
      cy.get('@customImageTable')
        .find('tbody tr')
        .should('have.length', mockImages.length);

      // Assert that the correct number of Image entries are present in the recoveryImageTable
      cy.get('@recoveryImageTable')
        .find('tbody tr')
        .should('have.length', mockImages.length);

      checkActionMenu('@customImageTable', mockImages); // For the custom image table
      checkActionMenu('@recoveryImageTable', mockImages); // For the recovery image table
    });
  });
});
