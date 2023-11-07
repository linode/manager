import { entityTag } from 'support/constants/cypress';
import { createLinode } from 'support/api/linodes';
import {
  containsClick,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible,
} from 'support/helpers';
import { apiMatcher } from 'support/util/intercepts';
import { randomLabel } from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';
import { dcPricingRegionNotice } from 'support/constants/dc-specific-pricing';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';

const deployNodeBalancer = () => {
  cy.get('[data-qa-deploy-nodebalancer]').click();
};

const createNodeBalancerWithUI = (nodeBal, isDcPricingTest = false) => {
  const regionName = getRegionById(nodeBal.region).label;

  cy.visitWithLogin('/nodebalancers/create');
  getVisible('[id="nodebalancer-label"]').click().clear().type(nodeBal.label);
  containsClick('create a tag').type(entityTag);

  if (isDcPricingTest) {
    const newRegion = getRegionById('br-gru');

    cy.wait(['@getClientStream', '@getFeatureFlags']);

    // Confirms that the price will not display when the region is not selected
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText('/month').should('not.exist');
    });

    // Confirms that the price will show up when the region is selected
    ui.regionSelect.open().type(`${regionName}{enter}`);
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText(`$10/month`).should('be.visible');
    });

    // TODO: DC Pricing - M3-7086: Uncomment docs link assertion when docs links are added.
    // cy.findByText(dcPricingDocsLabel)
    //   .should('be.visible')
    //   .should('have.attr', 'href', dcPricingDocsUrl);

    // Confirms that the summary updates to reflect price changes if the user changes their region.
    ui.regionSelect.open().clear().type(`${newRegion.label}{enter}`);
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText(`$14/month`).should('be.visible');
    });

    // Confirms that a notice is shown in the "Region" section of the NodeBalancer Create form informing the user of DC-specific pricing
    cy.findByText(dcPricingRegionNotice, { exact: false }).should('be.visible');
  }
  // this will create the NB in newark, where the default Linode was created
  ui.regionSelect.open().clear().type(`${regionName}{enter}`);

  // node backend config
  fbtClick('Label').type(randomLabel());

  cy.findByLabelText('IP Address')
    .should('be.visible')
    .click()
    .type(nodeBal.linodePrivateIp);

  ui.autocompletePopper
    .findByTitle(nodeBal.linodePrivateIp)
    .should('be.visible')
    .click();

  deployNodeBalancer();
};

authenticate();
describe('create NodeBalancer', () => {
  before(() => {
    cleanUp(['tags', 'node-balancers', 'linodes']);
  });

  it('creates a NodeBalancer in a region with base pricing', () => {
    // create a linode in NW where the NB will be created
    const region = chooseRegion();
    createLinode({ region: region.id }).then((linode) => {
      const nodeBal = {
        label: randomLabel(),
        region: region.id,
        linodePrivateIp: linode.ipv4[1],
      };
      // catch request
      cy.intercept('POST', apiMatcher('nodebalancers')).as(
        'createNodeBalancer'
      );
      createNodeBalancerWithUI(nodeBal);
      cy.wait('@createNodeBalancer')
        .its('response.statusCode')
        .should('eq', 200);
    });
  });

  /*
   * - Confirms label field displays error if it contains special characters.
   * - Confirms session stickiness field displays error if protocol is not HTTP or HTTPS.
   */
  it('displays API errors for NodeBalancer Create form fields', () => {
    const region = chooseRegion();
    createLinode({ region: region.id }).then((linode) => {
      // catch request
      cy.intercept('POST', apiMatcher('nodebalancers')).as(
        'createNodeBalancer'
      );
      createNodeBalancerWithUI({
        // Label should have a special character to trigger API error.
        label: `${randomLabel()}-^`,
        linodePrivateIp: linode.ipv4[1],
        region: region.id,
      });
      fbtVisible(`Label can't contain special characters or spaces.`);
      getVisible('[id="nodebalancer-label"]')
        .click()
        .clear()
        .type(randomLabel());
      getClick('[data-qa-protocol-select="true"]').type('TCP{enter}');
      getClick('[data-qa-session-stickiness-select]').type(
        'HTTP Cookie{enter}'
      );
      deployNodeBalancer();
      const errMessage = `Stickiness http_cookie requires protocol 'http' or 'https'`;
      cy.wait('@createNodeBalancer')
        .its('response.body')
        .should('deep.equal', {
          errors: [{ field: 'configs[0].stickiness', reason: errMessage }],
        });
      fbtVisible(errMessage);
    });
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during NodeBalancer creation.
   * - Confirms that pricing notice is shown in "Region" section.
   * - Confirms that notice is shown when selecting a region with a different price structure.
   */
  it('shows DC-specific pricing information when creating a NodeBalancer', () => {
    const initialRegion = getRegionById('us-west');
    createLinode({ region: initialRegion.id }).then((linode) => {
      const nodeBal = {
        label: randomLabel(),
        region: initialRegion.id,
        linodePrivateIp: linode.ipv4[1],
      };

      // catch request
      cy.intercept('POST', apiMatcher('nodebalancers')).as(
        'createNodeBalancer'
      );

      mockAppendFeatureFlags({
        dcSpecificPricing: makeFeatureFlagData(true),
      }).as('getFeatureFlags');
      mockGetFeatureFlagClientstream().as('getClientStream');

      createNodeBalancerWithUI(nodeBal, true);
    });
  });
});
