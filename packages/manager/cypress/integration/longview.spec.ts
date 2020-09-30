/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode } from '../support/api/linodes';
import { createClient, deleteAllTestClients } from '../support/api/longview';
import { containsVisibleClick, getVisibleClick } from '../support/helpers';
import { waitForAppLoad } from '../support/ui/common';

describe('longview', () => {
  it('tests longview', () => {
    const linodePassword = '12345&TestingTesting';
    const clientLabel = 'cy-test-client';
    cy.server();
    cy.visitWithLogin('/dashboard');
    createLinode(undefined, linodePassword).then(linode => {
      createClient(undefined, clientLabel).then(client => {
        const linodeIp = linode['ipv4'][0];
        const longviewLabel = client.label;
        cy.visit('/longview');
        cy.contains(longviewLabel).should('be.visible');
        cy.get('code')
          .first()
          .then($code => {
            const curlCommand = $code.text();
            cy.exec('./cypress/support/longview.sh', {
              failOnNonZeroExit: false,
              timeout: 10000000,
              env: {
                LINODEIP: `${linodeIp}`,
                LINODEPASSWORD: `${linodePassword}`,
                CURLCOMMAND: `${curlCommand}`
              }
            }).then(out => {
              console.log(out.stdout);
              console.log(out.stderr);
            });
            waitForAppLoad('/longview', false);
            cy.get('[data-testid="longview-client-row"]');
            cy.contains('All packages up to date');
            cy.contains('View details').should('be.visible');
            cy.contains('Swap').should('be.visible');
            deleteAllTestClients();
          });
      });
    });
  });
});
