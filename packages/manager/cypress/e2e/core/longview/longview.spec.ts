import type { Linode, LongviewClient } from '@linode/api-v4';
import { createLongviewClient } from '@linode/api-v4';
import { randomLabel, randomString } from 'support/util/random';
import { cleanUp } from 'support/util/cleanup';
import { authenticate } from 'support/api/authentication';
import { longviewInstallTimeout } from 'support/constants/longview';
import { createAndBootLinode } from 'support/util/linodes';
import {
  interceptGetLongviewClients,
  interceptFetchLongviewStatus,
} from 'support/intercepts/longview';

/**
 * Returns the command used to install Longview which is shown in Cloud's UI.
 *
 * @param installCode - Longview client install code.
 *
 * @returns Install command string.
 */
const getInstallCommand = (installCode: string): string => {
  return `curl -s https://lv.linode.com/${installCode} | sudo bash`;
};

/**
 * Installs Longview on a Linode.
 *
 * @param linodeIp - IP of Linode on which to install Longview.
 * @param linodePass - Root password of Linode on which to install Longview.
 * @param installCommand - Longview installation command.
 *
 * @returns Cypress chainable.
 */
const installLongview = (
  linodeIp: string,
  linodePass: string,
  installCommand: string
) => {
  return cy.exec('./cypress/support/longview.sh', {
    failOnNonZeroExit: true,
    timeout: longviewInstallTimeout,
    env: {
      LINODEIP: linodeIp,
      LINODEPASSWORD: linodePass,
      CURLCOMMAND: installCommand,
    },
  });
};

/**
 * Cloud Manager makes several requests to the Longview endpoint when loading
 * the landing page. This function waits for a request related to a specific
 * Longview clients.
 *
 * @param alias - Alias assigned to the original request intercept.
 * @param apiKey - API key for desired Longview client.
 */
const waitForLongviewFetch = (alias: string, apiKey: string) => {
  cy.wait(`@${alias}`).then((interceptedRequest) => {
    const requestBody = (interceptedRequest.request?.body || '') as string;
    if (!requestBody.includes(apiKey)) {
      interceptFetchLongviewStatus().as(alias);
      waitForLongviewFetch(alias, apiKey);
    }
  });
};

const waitForLongviewData = (alias: string, apiKey: string) => {
  cy.wait(`@${alias}`, { timeout: 120000 }).then((interceptedRequest) => {
    const responseBody = interceptedRequest.response?.body?.[0];
    const apiKeyMatches = (interceptedRequest?.request?.body ?? '').includes(
      apiKey
    );
    const containsUpdate =
      responseBody?.ACTION === 'lastUpdated' &&
      responseBody?.DATA?.updated !== 0;

    if (!(apiKeyMatches && containsUpdate)) {
      interceptFetchLongviewStatus().as(alias);
      waitForLongviewData(alias, apiKey);
    }
  });
};

/* eslint-disable sonarjs/no-duplicate-string */
authenticate();
describe('longview', () => {
  before(() => {
    cleanUp(['linodes', 'longview-clients']);
  });

  it('tests longview - rd', () => {
    const linodePassword = randomString(32, {
      symbols: false,
      lowercase: true,
      uppercase: true,
      numbers: true,
      spaces: false,
    });

    const createLinodeAndClient = async () => {
      return Promise.all([
        createAndBootLinode({
          root_pass: linodePassword,
          type: 'g6-standard-1',
        }),
        createLongviewClient(randomLabel()),
      ]);
    };

    // Create Linode and Longview Client before loading Longview landing page.
    cy.defer(
      createLinodeAndClient(),
      'Creating Linode and Longview Client...'
    ).then(([linode, client]: [Linode, LongviewClient]) => {
      const linodeIp = linode.ipv4[0];
      const installCommand = getInstallCommand(client.install_code);

      interceptGetLongviewClients().as('getLongviewClients');
      interceptFetchLongviewStatus().as('fetchLongviewStatus');
      cy.visitWithLogin('/longview');
      cy.wait('@getLongviewClients');

      // Wait for Longview clients to be fetched and UI to update.
      cy.findByText('Hostname not available').should('not.exist');
      cy.findByText('Loading...').should('not.exist');

      // Find the
      cy.get(`[data-qa-longview-client="${client.id}"]`)
        .should('be.visible')
        .within(() => {
          cy.findByText(client.label).should('be.visible');
          cy.findByText(client.api_key).should('be.visible');
          cy.contains(installCommand).should('be.visible');
          cy.findByText('Waiting for data...');
        });

      // Install Longview on Linode by SSHing into machine and executing cURL command.
      installLongview(linodeIp, linodePassword, installCommand).then(
        (output) => {
          console.log(output.stdout);
          console.log(output.stderr);
        }
      );

      // Sometimes Cloud Manager does not automatically update and
      // requires a page refresh to show stats, etc.
      waitForLongviewData('fetchLongviewStatus', client.api_key);
      cy.get(`[data-qa-longview-client="${client.id}"]`)
        .should('be.visible')
        .within(() => {
          cy.findByText('Waiting for data...').should('not.exist');
          cy.findByText('CPU').should('be.visible');
          cy.findByText('RAM').should('be.visible');
          cy.findByText('Swap').should('be.visible');
          cy.findByText('Load').should('be.visible');
          cy.findByText('Network').should('be.visible');
          cy.findByText('Storage').should('be.visible');
        });
    });
  });
});
