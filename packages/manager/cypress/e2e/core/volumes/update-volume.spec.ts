import { createVolume } from '@linode/api-v4/lib/volumes';
import { Volume } from '@linode/api-v4/types';
import { volumeRequestPayloadFactory } from 'src/factories/volume';
import { authenticate } from 'support/api/authentication';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { cleanUp } from 'support/util/cleanup';

authenticate();
describe('volume update flow', () => {
  before(() => {
    cleanUp(['tags', 'volumes']);
  });

  /*
   * - Confirms that volume label and tags can be changed from the Volumes landing page.
   */
  it("updates a volume's label and tags", () => {
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const newLabel = randomLabel();
    const newTags = [randomLabel(5), randomLabel(5), randomLabel(5)];

    cy.defer(createVolume(volumeRequest), 'creating volume').then(
      (volume: Volume) => {
        cy.visitWithLogin('/volumes', {
          // Temporarily force volume table to show up to 100 results per page.
          // This is a workaround while we wait to get stuck volumes removed.
          // @TODO Remove local storage override when stuck volumes are removed from test accounts.
          localStorageOverrides: {
            PAGE_SIZE: 100,
          },
        });

        // Confirm that volume is listed on landing page, click "Edit" to open drawer.
        cy.findByText(volume.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Edit').click();
          });

        // Enter new label and add tags, click "Save Changes".
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.findByText('Edit Volume').should('be.visible');
          cy.findByDisplayValue(volume.label)
            .should('be.visible')
            .click()
            .type(`{selectall}{backspace}${newLabel}{enter}`);

          cy.findByText('Type to choose or create a tag.')
            .should('be.visible')
            .click()
            .type(`${newTags.join('{enter}')}{enter}`);

          cy.findByText('Save Changes').should('be.visible').click();
        });

        // Confirm new label is applied, click "Edit" to re-open drawer.
        cy.findByText(newLabel)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            cy.findByText('Edit').click();
          });

        // Confirm new label and tags are shown.
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.findByText('Edit Volume').should('be.visible');
          cy.findByDisplayValue(newLabel).should('be.visible');

          newTags.forEach((newTag) => {
            cy.findByText(newTag).should('be.visible');
          });
        });
      }
    );
  });
});
