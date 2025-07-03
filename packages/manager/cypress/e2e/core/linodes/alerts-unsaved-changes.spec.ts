import { linodeFactory, regionFactory } from '@linode/utilities';
// import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
// import { mockGetUserPreferences } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';

const mockEnabledRegion = regionFactory.build({
  capabilities: ['Linodes'],
  monitors: {
    alerts: ['Linodes'],
  },
});
const mockDisabledRegion = regionFactory.build({
  capabilities: ['Linodes'],
  monitors: {
    alerts: [],
  },
});
const mockRegions = [
  { region: mockEnabledRegion, message: 'enabled region' },
  { region: mockDisabledRegion, message: 'disabled region' },
];

describe('Edit to page should trigger modal appearance', () => {
  mockRegions.forEach(({ region, message }) => {
    describe(`Edit to ${message} should trigger modal appearance`, () => {
      beforeEach(() => {
        const mockLinode = linodeFactory.build({
          id: randomNumber(),
          label: randomLabel(),
          region: region.id,
        });
        mockGetRegions([region]).as('getRegions');
        mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
        cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
        cy.wait(['@getRegions', '@getLinode']);
      });

      it('after edit to toggle', () => {
        cy.findByText('Default Alerts')
          .closest('[data-qa-paper]')
          .within(() => {
            cy.get('[data-qa-alerts-panel]')
              .first()
              .should('be.visible')
              .within(() => {
                ui.toggle
                  .find()
                  .should('be.visible')
                  .should('be.enabled')
                  .click();
              });
          });
        // navigate to another page
        // cy.get('[aria-label="Images"]').should('be.visible').should('be.enabled').click();
        ui.nav.findItemByTitle('Placement Groups').should('be.visible').click();
        cy.url().should('endWith', '/placement-groups');
      });
    });
  });
});

//   after edit to toggle
// after edit to numeric input
// when navigating away to another page
// when navigating away to another tab
