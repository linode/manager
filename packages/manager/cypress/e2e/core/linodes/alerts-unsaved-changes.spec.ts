import { linodeFactory, regionFactory } from '@linode/utilities';
import { mockGetAlertDefinition } from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { randomLabel, randomNumber } from 'support/util/random';

import { alertFactory } from 'src/factories';

// region enables beta alerts
const mockRegion = regionFactory.build({
  capabilities: ['Linodes'],
  monitors: {
    alerts: ['Linodes'],
  },
});
const mockLinodeBeta = linodeFactory.build({
  id: randomNumber(),
  label: randomLabel(),
  region: mockRegion.id,
  alerts: { system: [1, 2], user: [3] },
});
// const mockLinodeLegacy = linodeFactory.build({
//   id: randomNumber(),
//   label: randomLabel(),
//   region: mockRegion.id,
// });
const mockLinodes = [
  {
    linode: mockLinodeBeta,
    message: 'Linode w/ beta alerts',
    isBeta: true,
  },
  // ,{
  //   linode: mockLinodeLegacy,
  //   message: 'Linode w/ legacy alerts',
  //   isBeta: false
  // }
];
const MOCK_NUMERIC_TEST_VALUE = '101';

describe('Edit to page should trigger modal appearance', () => {
  // execute same set of tests for linode w/ beta alerts, then for linode w/ legacy alerts
  mockLinodes.forEach(({ linode, message, isBeta }) => {
    describe(`${message}: edit should trigger modal appearance`, () => {
      beforeEach(() => {
        mockAppendFeatureFlags({
          aclpBetaServices: {
            linode: {
              alerts: true,
              metrics: false,
            },
          },
        }).as('getFeatureFlags');
        const alertDefinitions = [
          alertFactory.build({
            id: 1,
            description: randomLabel(),
            label: randomLabel(),
            service_type: 'linode',
            severity: 1,
            status: 'enabled',
            type: 'system',
          }),
          alertFactory.build({
            id: 2,

            description: randomLabel(),
            label: randomLabel(),
            service_type: 'linode',
            severity: 1,
            status: 'enabled',
            type: 'system',
          }),
          alertFactory.build({
            id: 3,
            description: randomLabel(),
            label: randomLabel(),
            service_type: 'linode',
            severity: 1,
            status: 'enabled',
            type: 'user',
          }),
        ];
        //  cy.wrap(alertDefinitions).as('alertDefinitions');
        mockGetAlertDefinition('linode', alertDefinitions).as(
          'getAlertDefinitions'
        );
        mockGetRegions([mockRegion]).as('getRegions');
        mockGetLinodeDetails(linode.id, linode).as('getLinode');
        cy.visitWithLogin(`/linodes/${linode.id}/alerts`);
        cy.wait(['@getRegions', '@getLinode']);
      });

      it('after edit to toggle', () => {
        cy.get('[data-reach-tab-panels]')
          .should('be.visible')
          .within(() => {
            if (isBeta) {
              cy.wait(['@getAlertDefinitions']);
            }
            // cy.get('[data-qa-alerts-panel]')
            //   .first()
            //   .should('be.visible')
            //   .within(() => {
            ui.toggle
              .find()
              .should('be.visible')
              .should('have.attr', 'data-qa-toggle', 'true')
              .should('be.enabled')
              .click({ multiple: true });
            // click changes toggle to false
            ui.toggle.find().should('have.attr', 'data-qa-toggle', 'false');
            //     });
          });

        // navigate to another page
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
        cy.get('[data-reach-tab-panels]')
          .should('be.visible')
          .within(() => {
            // cy.get('[data-qa-alerts-panel]')
            //   .first()
            //   .should('be.visible')
            //   .within(() => {
            // edit to first toggle persists
            ui.toggle
              .find()
              .should('be.visible')
              .should('have.attr', 'data-qa-toggle', 'false');
          });
      });

      xit('after edit to numeric input', () => {
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

      xit('reverted edits do not trigger modal', () => {
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
                  .then((alertToggle) =>
                    cy.wrap(alertToggle).as('alertToggle')
                  );
                cy.get('@alertToggle').click();
                // click changes toggle to false
                cy.get('@alertToggle').should(
                  'have.attr',
                  'data-qa-toggle',
                  'false'
                );

                // undo edit, toggle it back to true
                cy.get('@alertToggle').click();
                cy.get('@alertToggle').should(
                  'have.attr',
                  'data-qa-toggle',
                  'true'
                );
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
