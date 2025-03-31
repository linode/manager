import { authenticate } from 'support/api/authentication';
import { entityTag } from 'support/constants/cypress';
import {
  dcPricingDocsLabel,
  dcPricingDocsUrl,
} from 'support/constants/dc-specific-pricing';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';

import type { NodeBalancer } from '@linode/api-v4';

const deployNodeBalancer = () => {
  cy.get('[data-qa-deploy-nodebalancer]').click();
};

import {
  linodeFactory,
  nodeBalancerFactory,
  regionFactory,
} from '@linode/utilities';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { interceptCreateNodeBalancer } from 'support/intercepts/nodebalancers';
import { mockGetRegions } from 'support/intercepts/regions';

const createNodeBalancerWithUI = (
  nodeBal: NodeBalancer,
  isDcPricingTest = false
) => {
  const regionName = getRegionById(nodeBal.region).label;

  cy.visitWithLogin('/nodebalancers/create');
  cy.get('[id="nodebalancer-label"]').should('be.visible').click();
  cy.focused().clear();
  cy.focused().type(nodeBal.label);
  cy.findByPlaceholderText(/create a tag/i).click();
  cy.focused().type(entityTag);

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
  cy.findByText('Label').click();
  cy.focused().type(randomLabel());

  cy.findByLabelText('IP Address').should('be.visible').click();
  cy.focused().type(nodeBal.ipv4);

  ui.autocompletePopper.findByTitle(nodeBal.ipv4).should('be.visible').click();

  deployNodeBalancer();
};

authenticate();
beforeEach(() => {
  cy.tag('method:e2e', 'purpose:dcTesting');
});
describe('create NodeBalancer', () => {
  before(() => {
    cleanUp(['tags', 'node-balancers', 'linodes']);
  });

  it('creates a NodeBalancer in a region with base pricing', () => {
    const region = chooseRegion();
    const linodePayload = {
      // NodeBalancers require Linodes with private IPs.
      private_ip: true,
      region: region.id,
    };

    cy.defer(() => createTestLinode(linodePayload)).then((linode) => {
      const nodeBal = nodeBalancerFactory.build({
        ipv4: linode.ipv4[1],
        label: randomLabel(),
        region: region.id,
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
    const region = regionFactory.build({ capabilities: ['NodeBalancers'] });
    const linode = linodeFactory.build({ ipv4: ['192.168.1.213'] });

    mockGetRegions([region]);
    mockGetLinodes([linode]);
    interceptCreateNodeBalancer().as('createNodeBalancer');

    cy.visitWithLogin('/nodebalancers/create');

    cy.findByLabelText('NodeBalancer Label')
      .should('be.visible')
      .type('my-nodebalancer-1');

    ui.autocomplete.findByLabel('Region').should('be.visible').click();

    ui.autocompletePopper
      .findByTitle(region.id, { exact: false })
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.findByLabelText('Label').type('my-node-1');

    cy.findByLabelText('IP Address').click();
    cy.focused().type(linode.ipv4[0]);

    ui.autocompletePopper.findByTitle(linode.label).click();

    ui.button
      .findByTitle('Create NodeBalancer')
      .scrollIntoView()
      .should('be.enabled')
      .should('be.visible')
      .click();

    const expectedError =
      'Address Restricted: IP must not be within 192.168.0.0/17';

    cy.wait('@createNodeBalancer')
      .its('response.body')
      .should('deep.equal', {
        errors: [
          { field: 'region', reason: 'region is not valid' },
          { field: 'configs[0].nodes[0].address', reason: expectedError },
        ],
      });

    cy.findByText(expectedError).should('be.visible');
  });

  /*
   * - Confirms DC-specific pricing UI flow works as expected during NodeBalancer creation.
   * - Confirms that pricing docs link is shown in "Region" section.
   */
  it('shows DC-specific pricing information when creating a NodeBalancer', () => {
    const initialRegion = getRegionById('us-west');
    const linodePayload = {
      // NodeBalancers require Linodes with private IPs.
      private_ip: true,
      region: initialRegion.id,
    };
    cy.defer(() => createTestLinode(linodePayload)).then((linode) => {
      const nodeBal = nodeBalancerFactory.build({
        ipv4: linode.ipv4[1],
        label: randomLabel(),
        region: initialRegion.id,
      });

      // catch request
      interceptCreateNodeBalancer().as('createNodeBalancer');

      createNodeBalancerWithUI(nodeBal, true);
    });
  });
});
