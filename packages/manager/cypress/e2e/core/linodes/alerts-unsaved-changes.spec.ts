import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';

const MOCK_NUMERIC_TEST_VALUE = '101';

describe('Edit to page should trigger modal appearance', () => {
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
  mockRegions.forEach(({ region, message }) => {
    describe(`Edit to ${message} should trigger modal appearance`, () => {
      beforeEach(() => {
        const mockLinode = linodeFactory.build({
          id: randomNumber(),
          label: randomLabel(),
          region: region.id,
          // alert toggle will be enabled/on/true if value > 0
          alerts: {
            cpu: 180,
            io: 10000,
            network_in: 10,
            network_out: 10,
            transfer_quota: 80,
          },
        });
        mockGetRegions([region]).as('getRegions');
        mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
        cy.visitWithLogin(`/linodes/${mockLinode.id}/alerts`);
        cy.wait(['@getRegions', '@getLinode']);
      });

      it('after edit to toggle', () => {
        cy.get('[data-reach-tab-panels]')
          .should('be.visible')
          .within(() => {
            // find first toggle
            cy.get('[data-qa-alerts-panel]')
              .first()
              .should('be.visible')
              .within(() => {
                ui.toggle
                  .find()
                  .should('be.visible')
                  .should('have.attr', 'data-qa-toggle', 'true')
                  .should('be.enabled')
                  .click();
                // click changes toggle to false
                ui.toggle.find().should('have.attr', 'data-qa-toggle', 'false');
              });
          });

        // navigate to another page
        ui.nav.findItemByTitle('Placement Groups').should('be.visible').click();
        ui.dialog
          .findByTitle('Unsaved Changes')
          .should('be.visible')
          .within(() => {
            // close modal, return to Alerts tab
            ui.button
              .findByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });
        // url does not change
        cy.url().should('endWith', '/alerts');
        cy.get('[data-reach-tab-panels]')
          .should('be.visible')
          .within(() => {
            cy.get('[data-qa-alerts-panel]')
              .first()
              .should('be.visible')
              .within(() => {
                // edit to toggle persists
                ui.toggle
                  .find()
                  .should('be.visible')
                  .should('have.attr', 'data-qa-toggle', 'false');
              });
          });

        // navigate to another tab also triggers modal
        ui.tabList.findTabByTitle('Settings').click();
        ui.dialog.findByTitle('Unsaved Changes').should('be.visible');
      });

      it('after edit to numeric input', () => {
        cy.get('[data-reach-tab-panels]')
          .should('be.visible')
          .within(() => {
            cy.get('[data-qa-alerts-panel]')
              .first()
              .should('be.visible')
              .within(() => {
                cy.get('[data-testid="textfield-input"]')
                  .should('be.visible')
                  .should('be.enabled')
                  .click();
                cy.focused().type(`{selectall}${MOCK_NUMERIC_TEST_VALUE}`);
              });
          });
        // attempt to navigate to another page
        ui.nav.findItemByTitle('Placement Groups').should('be.visible').click();
        // url does not change
        cy.url().should('endWith', '/alerts');
        ui.dialog
          .findByTitle('Unsaved Changes')
          .should('be.visible')
          .within(() => {
            // close modal, return to Alerts tab
            ui.button
              .findByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });
        cy.url().should('endWith', '/alerts');
        cy.get('[data-qa-alerts-panel]')
          .first()
          .should('be.visible')
          .within(() => {
            // edit to first toggle persists
            cy.get('[data-testid="textfield-input"')
              .should('be.visible')
              .should('have.value', MOCK_NUMERIC_TEST_VALUE);
          });

        // attempt to navigate to another tab
        ui.tabList.findTabByTitle('Settings').click();
        // url does not change
        cy.url().should('endWith', '/alerts');
        ui.dialog
          .findByTitle('Unsaved Changes')
          .should('be.visible')
          .within(() => {
            // close modal, return to Alerts tab
            ui.button
              .findByTitle('Cancel')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });
        cy.url().should('endWith', '/alerts');
      });

      it('reverted edits do not trigger modal', () => {
        cy.get('[data-reach-tab-panels]')
          .should('be.visible')
          .within(() => {
            cy.get('[data-qa-alerts-panel]')
              .first()
              .should('be.visible')
              .within(() => {
                ui.toggle
                  .find()
                  .should('be.visible')
                  .should('be.enabled')
                  .should('have.attr', 'data-qa-toggle', 'true')
                  .click();
                // click changes toggle to false
                ui.toggle.find().should('have.attr', 'data-qa-toggle', 'false');

                // undo edit, toggle it back to true
                ui.toggle.find().click();
                ui.toggle.find().should('have.attr', 'data-qa-toggle', 'true');
              });
          });

        // navigate to another tab
        ui.tabList.findTabByTitle('Settings').should('be.visible').click();
        // new page loads
        cy.url().should('endWith', '/settings');
      });
    });
  });
});
