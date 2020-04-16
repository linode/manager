
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
// import { assertToast } from '../../support/ui/events';

describe('create NodeBalancer', () => {

  it('creates a nodebal', () => {

    // create a linode in NW where the NB will be created
    createLinode().then(linode=>{
        cy.server();
        cy.route({
          method: 'POST',
          url: '*/nodebalancers'
        }).as('createNodeBalancer');
        const privateIp = linode.ipv4[1];
        const nodeBalLabel = makeNodeBalLabel();
        cy.visitWithLogin('/nodebalancers/create');
        cy.findByText('NodeBalancer Settings');
        cy.findByLabelText('NodeBalancer Label').click().type(nodeBalLabel);
        cy.contains('create a tag').click().type(testNodeBalTag);
        // this will create the NB in newark, where the default Linode was created
        cy.contains('Regions')
        .click()
        .type('new {enter}');

        // node backend config
        cy.findByLabelText('Label').click().type(makeLinodeLabel());
        cy.contains('Enter IP Address').click().type(`${privateIp}{enter}`);
        
        // This is not an error, the tag is deploy-linode
        cy.get('[data-qa-deploy-linode]').click();
        cy.wait('@createNodeBalancer')
            .its('status')
            .should('be', 200);
        // cy.visit('/nodebalancers');

        deleteNodeBalancerByLabel(nodeBalLabel);
        deleteLinodeById(linode.id);
    });
  });
});
