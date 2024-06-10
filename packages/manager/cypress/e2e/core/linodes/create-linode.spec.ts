/**
 * @file Linode Create end-to-end tests.
 */

import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';
import { randomLabel, randomString } from 'support/util/random';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { cleanUp } from 'support/util/cleanup';
import { linodeCreatePage } from 'support/ui/pages';
import { authenticate } from 'support/api/authentication';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { interceptCreateLinode } from 'support/intercepts/linodes';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { interceptGetProfile } from 'support/intercepts/profile';

let username: string;

authenticate();
describe('Create Linode', () => {
  before(() => {
    cleanUp('linodes');
  });

  // Enable the `linodeCreateRefactor` feature flag.
  // TODO Delete these mocks once `linodeCreateRefactor` feature flag is retired.
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeCreateRefactor: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
  });

  /*
   * End-to-end tests to create Linodes for each available plan type.
   */
  describe('End-to-end', () => {
    // Run an end-to-end test to create a basic Linode for each plan type described below.
    describe('By plan type', () => {
      [
        {
          planType: 'Shared CPU',
          planLabel: 'Nanode 1 GB',
          planId: 'g6-nanode-1',
        },
        {
          planType: 'Dedicated CPU',
          planLabel: 'Dedicated 4 GB',
          planId: 'g6-dedicated-2',
        },
        {
          planType: 'High Memory',
          planLabel: 'Linode 24 GB',
          planId: 'g7-highmem-1',
        },
        {
          planType: 'Premium CPU',
          planLabel: 'Premium 4 GB',
          planId: 'g7-premium-2',
        },
        // TODO Include GPU plan types.
      ].forEach((planConfig) => {
        /*
         * - Parameterized end-to-end test to create a Linode for each plan type.
         * - Confirms that a Linode of the given plan type can be deployed.
         */
        it(`creates a ${planConfig.planType} Linode`, () => {
          const linodeRegion = chooseRegion({
            capabilities: ['Linodes', 'Premium Plans'],
          });
          const linodeLabel = randomLabel();

          interceptGetProfile().as('getProfile');

          interceptCreateLinode().as('createLinode');
          cy.visitWithLogin('/linodes/create');

          // Set Linode label, distribution, plan type, password, etc.
          linodeCreatePage.setLabel(linodeLabel);
          linodeCreatePage.selectImage('Debian 11');
          linodeCreatePage.selectRegionById(linodeRegion.id);
          linodeCreatePage.selectPlan(
            planConfig.planType,
            planConfig.planLabel
          );
          linodeCreatePage.setRootPassword(randomString(32));

          // Confirm information in summary is shown as expected.
          cy.get('[data-qa-linode-create-summary]')
            .scrollIntoView()
            .within(() => {
              cy.findByText('Debian 11').should('be.visible');
              cy.findByText(linodeRegion.label).should('be.visible');
              cy.findByText(planConfig.planLabel).should('be.visible');
            });

          // Create Linode and confirm it's provisioned as expected.
          ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.wait('@createLinode').then((xhr) => {
            const requestPayload = xhr.request.body;
            const responsePayload = xhr.response?.body;

            // Confirm that API request and response contain expected data
            expect(requestPayload['label']).to.equal(linodeLabel);
            expect(requestPayload['region']).to.equal(linodeRegion.id);
            expect(requestPayload['type']).to.equal(planConfig.planId);

            expect(responsePayload['label']).to.equal(linodeLabel);
            expect(responsePayload['region']).to.equal(linodeRegion.id);
            expect(responsePayload['type']).to.equal(planConfig.planId);

            // Confirm that Cloud redirects to details page
            cy.url().should('endWith', `/linodes/${responsePayload['id']}`);
          });

          cy.wait('@getProfile').then((xhr) => {
            username = xhr.response?.body.username;
          });

          // TODO Confirm whether or not toast notification should appear here.
          cy.findByText('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
            'be.visible'
          );

          // confirm that LISH Console via SSH section is correct
          cy.contains('LISH Console via SSH')
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.contains(
                `ssh -t ${username}@lish-${linodeRegion.id}.linode.com ${linodeLabel}`
              ).should('be.visible');
            });
        });
      });
    });
  });
});
