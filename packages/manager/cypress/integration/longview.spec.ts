/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode } from '../support/api/linodes';
import { containsVisibleClick } from '../support/helpers';

describe('longview', () => {
  it('tests longview', () => {
    const linodePassword = '12345&TestingTesting';
    cy.server();
    cy.route({
      method: 'POST',
      url: '*/longview/clients'
    }).as('addClient');
    cy.visitWithLogin('/dashboard');
    createLinode(undefined, linodePassword).then(linode => {
      const linodeIp = linode['ipv4'][0];
      cy.visit('/longview');
      containsVisibleClick('Add a Client');
      cy.wait('@addClient').then(xhr => {
        const longViewLabel = xhr.responseBody['label'];
        cy.contains(longViewLabel).should('be.visible');
        cy.get('code')
          .first()
          .should($code => {
            const curlCommand = $code.text();
            cy.exec('expect ./cypress/support/longview.sh', {
              env: {
                LINODEIP: `${linodeIp}`,
                LINODEPASSWORD: `${linodePassword}`,
                CURLCOMMAND: `${curlCommand}`
              }
            });
            cy.contains('View Details').should('be.visible');
            cy.contains('Storage').should('be.visible');
          });
      });
    });
  });
});
