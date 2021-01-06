import strings from '../../support/cypresshelpers';
import {
  makeLinodeLabel,
  deleteAllTestLinodes
} from '../../support/api/linodes';
import { assertToast } from '../../support/ui/events';
import {
  containsClick,
  containsVisible,
  getClick
} from '../../support/helpers';
import { selectRegionString } from '../../support/ui/constants';

describe('create linode', () => {
  beforeEach(() => {
    cy.visitWithLogin('/linodes/create');
    cy.get('[data-qa-deploy-linode]');
  });
  it('creates a nanode', () => {
    const rootpass = strings.randomPass();
    const linodeLabel = makeLinodeLabel();
    cy.intercept('POST', '*/linode/instances').as('linodeCreated');
    cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
    containsClick(selectRegionString).type('new {enter}');
    getClick('[id="g6-nanode-1"]');
    getClick('#linode-label')
      .clear()
      .type(linodeLabel);
    cy.get('#root-password').type(rootpass);
    getClick('[data-qa-deploy-linode]');
    cy.wait('@linodeCreated')
      .its('response.statusCode')
      .should('eq', 200);
    assertToast(`Your Linode ${linodeLabel} is being created.`);
    containsVisible('PROVISIONING');
    deleteAllTestLinodes();
  });
});
