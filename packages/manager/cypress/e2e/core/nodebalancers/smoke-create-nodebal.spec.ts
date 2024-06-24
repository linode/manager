import { entityTag } from 'support/constants/cypress';
import { createTestLinode } from 'support/util/linodes';

import { randomLabel } from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';
import {
  dcPricingDocsLabel,
  dcPricingDocsUrl,
} from 'support/constants/dc-specific-pricing';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';

import type { NodeBalancer } from '@linode/api-v4';

const deployNodeBalancer = () => {
  cy.get('[data-qa-deploy-nodebalancer]').click();
};

import { nodeBalancerFactory } from 'src/factories';
import { interceptCreateNodeBalancer } from 'support/intercepts/nodebalancers';

const createNodeBalancerWithUI = (
  nodeBal: NodeBalancer,
  isDcPricingTest = false
) => {
  const regionName = getRegionById(nodeBal.region).label;

  cy.visitWithLogin('/nodebalancers/create');
  cy.get('[id="nodebalancer-label"]')
    .should('be.visible')
    .click()
    .clear()
    .type(nodeBal.label);
  cy.contains('create a tag').click().type(entityTag);

  if (isDcPricingTest) {
    const newRegion = getRegionById('br-gru');

    // Confirms that the price will not display when the region is not selected
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText('/month').should('not.exist');
    });

    // Confirms that the price will show up when the region is selected
    ui.regionSelect.find().click().type(`${regionName}{enter}`);
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText(`$10/month`).should('be.visible');
    });

    // Confirm there is a docs link to the pricing page
    cy.findByText(dcPricingDocsLabel)
      .should('be.visible')
      .should('have.attr', 'href', dcPricingDocsUrl);

    // Confirms that the summary updates to reflect price changes if the user changes their region.
    ui.regionSelect.find().click().clear().type(`${newRegion.label}{enter}`);
    cy.get('[data-qa-summary="true"]').within(() => {
      cy.findByText(`$14/month`).should('be.visible');
    });
  }
  // this will create the NB in newark, where the default Linode was created
  ui.regionSelect.find().click().clear().type(`${regionName}{enter}`);

  // node backend config
  cy.findByText('Label').click().type(randomLabel());

  cy.findByLabelText('IP Address')
    .should('be.visible')
    .click()
    .type(nodeBal.ipv4);

  ui.autocompletePopper.findByTitle(nodeBal.ipv4).should('be.visible').click();

  deployNodeBalancer();
};

authenticate();
describe('create NodeBalancer', () => {
  before(() => {
    cleanUp(['tags', 'node-balancers', 'linodes']);
  });

  it('creates a NodeBalancer in a region with base pricing', () => {
    const region = chooseRegion();
    const linodePayload = {
      region: region.id,
      // NodeBalancers require Linodes with private IPs.
      private_ip: true,
    };

    cy.defer(() => createTestLinode(linodePayload)).then((linode) => {
      const nodeBal = nodeBalancerFactory.build({
        label: randomLabel(),
        region: region.id,
        ipv4: linode.ipv4[1],
      });
      // catch request
      interceptCreateNodeBalancer().as('createNodeBalancer');

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
    const linodePayload = {
      region: region.id,
      // NodeBalancers require Linodes with private IPs.
      private_ip: true,
    };
    cy.defer(() => createTestLinode(linodePayload)).then((linode) => {
      const nodeBal = nodeBalancerFactory.build({
        label: `${randomLabel()}-^`,
        ipv4: linode.ipv4[1],
        region: region.id,
      });

      // catch request
      interceptCreateNodeBalancer().as('createNodeBalancer');

      createNodeBalancerWithUI(nodeBal);
      cy.findByText(`Label can't contain special characters or spaces.`).should(
        'be.visible'
      );
      cy.get('[id="nodebalancer-label"]')
        .should('be.visible')
        .click()
        .clear()
        .type(randomLabel());

      cy.get('[data-qa-protocol-select="true"]').click().type('TCP{enter}');

      cy.get('[data-qa-session-stickiness-select]')
        .click()
        .type('HTTP Cookie{enter}');

      deployNodeBalancer();
      const errMessage = `Stickiness http_cookie requires protocol 'http' or 'https'`;
      cy.wait('@createNodeBalancer')
        .its('response.body')
        .should('deep.equal', {
          errors: [{ field: 'configs[0].stickiness', reason: errMessage }],
        });

      cy.findByText(errMessage).should('be.visible');
    });
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during NodeBalancer creation.
   * - Confirms that pricing docs link is shown in "Region" section.
   */
  it('shows DC-specific pricing information when creating a NodeBalancer', () => {
    const initialRegion = getRegionById('us-west');
    const linodePayload = {
      region: initialRegion.id,
      // NodeBalancers require Linodes with private IPs.
      private_ip: true,
    };
    cy.defer(() => createTestLinode(linodePayload)).then((linode) => {
      const nodeBal = nodeBalancerFactory.build({
        label: randomLabel(),
        region: initialRegion.id,
        ipv4: linode.ipv4[1],
      });

      // catch request
      interceptCreateNodeBalancer().as('createNodeBalancer');

      createNodeBalancerWithUI(nodeBal, true);
    });
  });
});
