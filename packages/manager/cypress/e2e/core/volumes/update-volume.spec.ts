import { authenticate } from 'support/api/authentication';
import { createActiveVolume } from 'support/api/volumes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { volumeRequestPayloadFactory } from 'src/factories/volume';

import type { Volume } from '@linode/api-v4';

authenticate();
describe('volume update flow', () => {
  before(() => {
    cleanUp(['tags', 'volumes']);
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Confirms that volume label can be changed from the Volumes landing page.
   */
  it("updates a volume's label", () => {
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const newLabel = randomLabel();

    cy.defer(() => createActiveVolume(volumeRequest), 'creating volume').then(
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
            cy.findByText('Active').should('be.visible');
          });
        ui.actionMenu
          .findByTitle(`Action menu for Volume ${volume.label}`)
          .should('be.visible')
          .click();
        cy.get('[data-testid="Edit"]').click();

        // Enter new label, click "Save Changes".
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.findByText('Edit Volume').should('be.visible');
          cy.findByDisplayValue(volume.label).should('be.visible').click();
          cy.focused().type(`{selectall}{backspace}${newLabel}`);

          cy.findByText('Save Changes').should('be.visible').click();
        });

        // Confirm new label is applied, click "Edit" to re-open drawer.
        cy.findByText(newLabel).should('be.visible');
        ui.actionMenu
          .findByTitle(`Action menu for Volume ${newLabel}`)
          .should('be.visible')
          .click();
        cy.get('[data-testid="Edit"]').click();

        // Confirm new label is shown.
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.findByText('Edit Volume').should('be.visible');
          cy.findByDisplayValue(newLabel).should('be.visible');
        });
      }
    );
  });

  /*
   * - Confirms that volume tags can be changed from the Volumes landing page.
   */
  it("updates volume's tags", () => {
    const volumeRequest = volumeRequestPayloadFactory.build({
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const newTags = [randomLabel(5), randomLabel(5), randomLabel(5)];

    cy.defer(() => createActiveVolume(volumeRequest), 'creating volume').then(
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
            cy.findByText('Active').should('be.visible');
          });

        ui.actionMenu
          .findByTitle(`Action menu for Volume ${volume.label}`)
          .should('be.visible')
          .click();

        cy.get('[data-testid="Manage Tags"]').click();

        // Add tags, click "Save Changes".
        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.findByText('Manage Volume Tags').should('be.visible');

          cy.findByPlaceholderText('Type to choose or create a tag.')
            .should('be.visible')
            .click();
          cy.focused().type(`${newTags.join('{enter}')}{enter}`);

          cy.findByText('Save Changes').should('be.visible').click();
        });

        // Confirm new tags are shown, click "Manage Volume Tags" to re-open drawer.
        cy.findByText(volumeRequest.label).should('be.visible');

        ui.actionMenu
          .findByTitle(`Action menu for Volume ${volume.label}`)
          .should('be.visible')
          .click();

        cy.get('[data-testid="Manage Tags"]').click();

        cy.get('[data-qa-drawer="true"]').within(() => {
          cy.findByText('Manage Volume Tags').should('be.visible');

          // Click the tags input field to see all the selected tags
          cy.findByRole('combobox').should('be.visible').click();

          newTags.forEach((newTag) => {
            cy.findAllByText(newTag).should('be.visible');
          });
        });
      }
    );
  });

  after(() => {
    cleanUp(['tags', 'volumes']);
  });
});
