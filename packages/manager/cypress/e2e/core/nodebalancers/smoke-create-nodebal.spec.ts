import { entityTag } from 'support/constants/cypress';
import { createLinode } from 'support/api/linodes';
import { selectRegionString } from 'support/ui/constants';
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
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';

const deployNodeBalancer = () => {
  cy.get('[data-qa-deploy-nodebalancer]').click();
};

const createNodeBalancerWithUI = (nodeBal) => {
  const regionName = getRegionById(nodeBal.region).label;
  cy.visitWithLogin('/nodebalancers/create');
  getVisible('[id="nodebalancer-label"]').click().clear().type(nodeBal.label);
  containsClick('create a tag').type(entityTag);
  // this will create the NB in newark, where the default Linode was created
  containsClick(selectRegionString).type(`${regionName}{enter}`);

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
    cleanUp(['tags', 'node-balancers']);
  });

  it('creates a nodebal - positive', () => {
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
  it('API error Handling', () => {
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
});
