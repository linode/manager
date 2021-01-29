/* eslint-disable sonarjs/no-duplicate-string */
import { createLinode, deleteLinodeById } from '../support/api/linodes';
import { createClient, deleteClientById } from '../support/api/longview';
import { containsVisible, fbtVisible, getVisible } from '../support/helpers';
import { waitForAppLoad } from '../support/ui/common';
import strings from '../support/cypresshelpers';

describe('longview', () => {
  it('tests longview', () => {
    const linodePassword = strings.randomPass();
    const clientLabel = 'cy-test-client';
    cy.visitWithLogin('/dashboard');
    createLinode(undefined, linodePassword).then(linode => {
      createClient(undefined, clientLabel).then(client => {
        const linodeIp = linode['ipv4'][0];
        const clientLabel = client.label;
        cy.visit('/longview');
        containsVisible(clientLabel);
        fbtVisible('Waiting for data...').first();
        cy.get('code')
          .first()
          .then($code => {
            const curlCommand = $code.text();
            cy.exec('./cypress/support/longview.sh', {
              failOnNonZeroExit: false,
              timeout: 480000,
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
            getVisible(`[data-testid="${client.id}"]`).within(() => {
              if (
                cy
                  .contains('Waiting for data...', {
                    timeout: 300000
                  })
                  .should('not.exist')
              ) {
                fbtVisible(clientLabel);
                getVisible(`[href="/longview/clients/${client.id}"]`);
                containsVisible('Swap');
              }
            });
            deleteLinodeById(linode.id);
            deleteClientById(client.id);
          });
      });
    });
  });
});
