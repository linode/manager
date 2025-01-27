import { createVolume } from '@linode/api-v4/lib/volumes';
import { Volume } from '@linode/api-v4';
import { ui } from 'support/ui';
import { authenticate } from 'support/api/authentication';
import { randomLabel } from 'support/util/random';
import { cleanUp } from 'support/util/cleanup';

authenticate();
describe('Search Volumes', () => {
  before(() => {
    cleanUp(['volumes']);
  });
  beforeEach(() => {
    cy.tag('method:e2e');
  });

  /*
   * - Confirm that volumes are API searchable and filtered in the UI.
   */
  it('creates two volumes and make sure they show up in the table and are searchable', () => {
    const createTwoVolumes = async (): Promise<[Volume, Volume]> => {
      return Promise.all([
        createVolume({
          label: randomLabel(),
          region: 'us-east',
          size: 10,
        }),
        createVolume({
          label: randomLabel(),
          region: 'us-east',
          size: 10,
        }),
      ]);
    };

    cy.defer(() => createTwoVolumes(), 'creating volumes').then(
      ([volume1, volume2]) => {
        cy.visitWithLogin('/volumes');

        // Confirm that both volumes are listed on the landing page.
        cy.findByText(volume1.label).should('be.visible');
        cy.findByText(volume2.label).should('be.visible');

        // Search for the first volume by label, confirm it's the only one shown.
        cy.findByPlaceholderText('Search Volumes').type(volume1.label);
        expect(cy.findByText(volume1.label).should('be.visible'));
        expect(cy.findByText(volume2.label).should('not.exist'));

        // Clear search, confirm both volumes are shown.
        cy.findByTestId('clear-volumes-search').click();
        cy.findByText(volume1.label).should('be.visible');
        cy.findByText(volume2.label).should('be.visible');

        // Use the main search bar to search and filter volumes
        ui.mainSearch.find().type(volume2.label);
        ui.autocompletePopper.findByTitle(volume2.label).click();

        // Confirm that only the second volume is shown.
        cy.findByText(volume1.label).should('not.exist');
        cy.findByText(volume2.label).should('be.visible');
      }
    );
  });
});
