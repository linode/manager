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

const deployNodeBalancer = () => {
  // This is not an error, the tag is deploy-linode
  cy.get('[data-qa-deploy-linode]').click();
};
const createNodeBalancerWithUI = nodeBal => {
  cy.visitWithLogin('/nodebalancers/create');
  cy.findByText('NodeBalancer Settings');
  cy.findByLabelText('NodeBalancer Label')
    .click()
    .type(nodeBal.label);
  cy.contains('create a tag')
    .click()
    .type(testNodeBalTag);
  // this will create the NB in newark, where the default Linode was created
  cy.contains('Select a Region')
    .click()
    .type('new {enter}');

  // node backend config
  cy.findByLabelText('Label')
    .click()
    .type(makeLinodeLabel());
  cy.contains('Enter IP Address')
    .click()
    .type(`${nodeBal.linodePrivateIp}{enter}`);
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

      cy.server();
      cy.route({
        method: 'POST',
        url: '*/nodebalancers'
      }).as('createNodeBalancer');
      createNodeBalancerWithUI(nodeBal);
      cy.wait('@createNodeBalancer')
        .its('status')
        .should('eq', 200);

      deleteNodeBalancerByLabel(nodeBal.label);
      deleteLinodeById(linode.id);
    });
  });
  it('API error Handling', () => {
    createLinode().then(linode => {
      cy.server();
      cy.route({
        method: 'POST',
        url: '*/nodebalancers'
      }).as('createNodeBalancer');
      createNodeBalancerWithUI({
        label: 'cy-test-dfghjk^uu7',
        linodePrivateIp: linode.ipv4[1]
      });
      cy.findByText(`Label can't contain special characters or spaces.`).should(
        'be.visible'
      );
      cy.findByLabelText('NodeBalancer Label')
        .click()
        .clear()
        .type(makeNodeBalLabel());
      cy.get('[data-qa-protocol-select]')
        .click()
        .type('TCP{enter}');
      cy.get('[data-qa-session-stickiness-select]')
        .click()
        .type('HTTP Cookie{enter}');
      deployNodeBalancer();
      const errMessage = `Stickiness http_cookie requires protocol 'http' or 'https'`;
      cy.wait('@createNodeBalancer')
        .its('response.body')
        .should('deep.equal', {
          errors: [{ field: 'configs[0].stickiness', reason: errMessage }]
        });
      cy.findByText(errMessage).should('be.visible');
      deleteLinodeById(linode.id);
    });
  });
});
