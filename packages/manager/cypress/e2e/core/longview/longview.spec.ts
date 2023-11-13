import type { Linode, LongviewClient } from '@linode/api-v4';
import { createLongviewClient } from '@linode/api-v4';
import { authenticate } from 'support/api/authentication';
import {
  longviewInstallTimeout,
  longviewStatusTimeout,
} from 'support/constants/longview';
import {
  interceptFetchLongviewStatus,
  interceptGetLongviewClients,
} from 'support/intercepts/longview';
import { cleanUp } from 'support/util/cleanup';
import { createAndBootLinode } from 'support/util/linodes';
import { randomLabel, randomString } from 'support/util/random';

// Timeout if Linode creation and boot takes longer than 1 and a half minutes.
const linodeCreateTimeout = 90000;

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
 * Waits for Cloud Manager to fetch Longview data and receive updates.
 *
 * Cloud Manager makes repeated requests to the `/fetch` endpoint, and this
 * function waits until one of these requests receives a response for the
 * desired Longview client indicating that its data has been updated.
 *
 * @param alias - Alias assigned to the initial HTTP intercept.
 * @param apiKey - API key for Longview client.
 */
const waitForLongviewData = (
  alias: string,
  apiKey: string,
  attempt: number = 0
) => {
  const maxAttempts = 50;
  // Escape route in case expected response is never received.
  if (attempt > maxAttempts) {
    throw new Error(
      `Timed out waiting for Longview client update after ${maxAttempts} attempts`
    );
  }
  cy.wait(`@${alias}`, { timeout: longviewStatusTimeout }).then(
    (interceptedRequest) => {
      const responseBody = interceptedRequest.response?.body?.[0];
      const apiKeyMatches = (interceptedRequest?.request?.body ?? '').includes(
        apiKey
      );
      const containsUpdate =
        responseBody?.ACTION === 'lastUpdated' &&
        responseBody?.DATA?.updated !== 0;

      if (!(apiKeyMatches && containsUpdate)) {
        interceptFetchLongviewStatus().as(alias);
        waitForLongviewData(alias, apiKey, attempt + 1);
      }
    }
  );
};

authenticate();
describe('longview', () => {
  before(() => {
    cleanUp(['linodes', 'longview-clients']);
  });

  /*
   * - Tests Longview installation end-to-end using real API data.
   * - Creates a Linode, connects to it via SSH, and installs Longview using the given cURL command.
   * - Confirms that Cloud Manager UI updates to reflect Longview installation and data.
   */
  it('can install Longview client on a Linode', () => {
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
    cy.defer(createLinodeAndClient(), {
      label: 'Creating Linode and Longview Client...',
      timeout: linodeCreateTimeout,
    }).then(([linode, client]: [Linode, LongviewClient]) => {
      const linodeIp = linode.ipv4[0];
      const installCommand = getInstallCommand(client.install_code);

      interceptGetLongviewClients().as('getLongviewClients');
      interceptFetchLongviewStatus().as('fetchLongviewStatus');
      cy.visitWithLogin('/longview');
      cy.wait('@getLongviewClients');

      // Find the table row for the new Longview client, assert expected information
      // is displayed inside of it.
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
          // TODO Output this to a log file.
          console.log(output.stdout);
          console.log(output.stderr);
        }
      );

      // Wait for Longview to begin serving data and confirm that Cloud Manager
      // UI updates accordingly.
      waitForLongviewData('fetchLongviewStatus', client.api_key);

      // Sometimes Cloud Manager UI does not updated automatically upon receiving
      // Longivew status data. Performing a page reload mitigates this issue.
      // TODO Remove call to `cy.reload()`.
      cy.reload();
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
