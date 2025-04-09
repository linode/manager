import { createImage } from '@linode/api-v4/lib/images';
import { authenticate } from 'support/api/authentication';
import { interceptGetLinodeDisks } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';

import type { Image, Linode } from '@linode/api-v4';

authenticate();
describe('Search Images', () => {
  before(() => {
    cleanUp(['linodes', 'images']);
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Confirm that images are API searchable and filtered in the UI.
   */
  it('creates two images and make sure they show up in the table and are searchable', () => {
    cy.defer(
      () =>
        createTestLinode(
          { image: 'linode/debian12', region: 'us-east' },
          { waitForDisks: true }
        ),
      'create linode'
    ).then((linode: Linode) => {
      interceptGetLinodeDisks(linode.id).as('getLinodeDisks');

      cy.visitWithLogin(`/linodes/${linode.id}/storage`);
      cy.wait('@getLinodeDisks').then((xhr) => {
        const disks = xhr.response?.body.data;
        const disk_id = disks[0].id;

        const createTwoImages = async (): Promise<[Image, Image]> => {
          return Promise.all([
            createImage({
              disk_id,
              label: randomLabel(),
            }),
            createImage({
              disk_id,
              label: randomLabel(),
            }),
          ]);
        };

        cy.defer(() => createTwoImages(), 'creating images').then(
          ([image1, image2]) => {
            cy.visitWithLogin('/images');

            // Confirm that both images are listed on the landing page.
            cy.contains(image1.label).should('be.visible');
            cy.contains(image2.label).should('be.visible');

            // Search for the first image by label, confirm it's the only one shown.
            cy.findByPlaceholderText('Search Images').type(image1.label);
            cy.contains(image1.label).should('be.visible');
            cy.contains(image2.label).should('not.exist');

            // Clear search, confirm both images are shown.
            cy.findByTestId('clear-images-search').click();
            cy.contains(image1.label).should('be.visible');
            cy.contains(image2.label).should('be.visible');

            // Use the main search bar to search and filter images
            ui.mainSearch.find().type(image2.label);
            ui.autocompletePopper.findByTitle(image2.label).click();

            // Confirm that only the second image is shown.
            cy.contains(image1.label).should('not.exist');
            cy.contains(image2.label).should('be.visible');
          }
        );
      });
    });
  });
});
