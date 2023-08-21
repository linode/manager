import { LongviewClient } from '@linode/api-v4';
import { randomLabel, randomString } from 'support/util/random';
import { createLinode } from 'support/api/linodes';
import { createClient } from 'support/api/longview';
import { containsVisible, fbtVisible, getVisible } from 'support/helpers';
import { waitForAppLoad } from 'support/ui/common';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';

/* eslint-disable sonarjs/no-duplicate-string */
authenticate();
describe('longview', () => {
  before(() => {
    cleanUp('longview-clients');
  });

  it('tests longview', () => {
    const linodePassword = randomString(32);
    const clientLabel = randomLabel();
    cy.visitWithLogin('/dashboard');
    createLinode({ root_pass: linodePassword }).then((linode) => {
      createClient(undefined, clientLabel).then((client: LongviewClient) => {
        const linodeIp = linode['ipv4'][0];
        const clientLabel = client.label;
        cy.visit('/longview');
        containsVisible(clientLabel);
        cy.contains('Waiting for data...').first().should('be.visible');
        cy.get('code')
          .first()
          .then(($code) => {
            const curlCommand = $code.text();
            cy.exec('./cypress/support/longview.sh', {
              failOnNonZeroExit: false,
              timeout: 480000,
              env: {
                LINODEIP: `${linodeIp}`,
                LINODEPASSWORD: `${linodePassword}`,
                CURLCOMMAND: `${curlCommand}`,
              },
            }).then((out) => {
              console.log(out.stdout);
              console.log(out.stderr);
            });
            waitForAppLoad('/longview', false);
            getVisible(`[data-testid="${client.id}"]`).within(() => {
              if (
                cy
                  .contains('Waiting for data...', {
                    timeout: 300000,
                  })
                  .should('not.exist')
              ) {
                fbtVisible(clientLabel);
                getVisible(`[href="/longview/clients/${client.id}"]`);
                containsVisible('Swap');
              }
            });
          });
      });
    });
  });
});
