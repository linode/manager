import {
  deleteNodeBalancerByLabel,
  makeNodeBalLabel,
  testNodeBalTag
} from '../../support/api/nodebalancers';
import {
  makeLinodeLabel,
  createLinode,
  deleteLinodeById
} from '../../support/api/linodes';
import { selectRegionString } from '../../support/ui/constants';
import {
  containsClick,
  fbtClick,
  fbtVisible,
  getClick,
  getVisible
} from '../../support/helpers';

const deployNodeBalancer = () => {
  // This is not an error, the tag is deploy-linode
  cy.get('[data-qa-deploy-linode]').click();
};
const createNodeBalancerWithUI = nodeBal => {
  cy.visitWithLogin('/nodebalancers/create');
  fbtVisible('NodeBalancer Settings');
  getVisible('[id="nodebalancer-label"]')
    .click()
    .clear()
    .type(nodeBal.label);
  containsClick('create a tag').type(testNodeBalTag);
  // this will create the NB in newark, where the default Linode was created
  containsClick(selectRegionString).type('new {enter}');

  // node backend config
  fbtClick('Label').type(makeLinodeLabel());
  containsClick('Enter IP Address').type(`${nodeBal.linodePrivateIp}{enter}`);
  deployNodeBalancer();
};

describe('create NodeBalancer', () => {
  it('creates a nodebal - positive', () => {
    // create a linode in NW where the NB will be created
    createLinode().then(linode => {
      const nodeBal = {
        label: makeNodeBalLabel(),
        linodePrivateIp: linode.ipv4[1]
      };
      // catch request
      cy.intercept('POST', '*/nodebalancers').as('createNodeBalancer');
      createNodeBalancerWithUI(nodeBal);
      cy.wait('@createNodeBalancer')
        .its('response.statusCode')
        .should('eq', 200);

      deleteNodeBalancerByLabel(nodeBal.label);
      deleteLinodeById(linode.id);
    });
  });
  it('API error Handling', () => {
    createLinode().then(linode => {
      // catch request
      cy.intercept('POST', '*/nodebalancers').as('createNodeBalancer');
      createNodeBalancerWithUI({
        label: 'cy-test-dfghjk^uu7',
        linodePrivateIp: linode.ipv4[1]
      });
      fbtVisible(`Label can't contain special characters or spaces.`);
      getVisible('[id="nodebalancer-label"]')
        .click()
        .clear()
        .type(makeNodeBalLabel());
      getClick('[data-qa-protocol-select="true"]').type('TCP{enter}');
      getClick('[data-qa-session-stickiness-select]').type(
        'HTTP Cookie{enter}'
      );
      deployNodeBalancer();
      const errMessage = `Stickiness http_cookie requires protocol 'http' or 'https'`;
      cy.wait('@createNodeBalancer')
        .its('response.body')
        .should('deep.equal', {
          errors: [{ field: 'configs[0].stickiness', reason: errMessage }]
        });
      fbtVisible(errMessage);
      deleteLinodeById(linode.id);
    });
  });
});
