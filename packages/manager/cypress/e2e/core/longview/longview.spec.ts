import type { LongviewClient } from '@linode/api-v4';
import { DateTime } from 'luxon';
import {
  longviewResponseFactory,
  longviewClientFactory,
  longviewAppsFactory,
  longviewLatestStatsFactory,
  longviewPackageFactory,
} from 'src/factories';
import { authenticate } from 'support/api/authentication';
import {
  longviewStatusTimeout,
  longviewEmptyStateMessage,
  longviewAddClientButtonText,
} from 'support/constants/longview';
import {
  interceptFetchLongviewStatus,
  mockGetLongviewClients,
  mockFetchLongviewStatus,
  mockCreateLongviewClient,
} from 'support/intercepts/longview';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';

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

/*
 * Mocks that represent the state of Longview while waiting for client to be installed.
 */
const longviewLastUpdatedWaiting = longviewResponseFactory.build({
  ACTION: 'lastUpdated',
  DATA: { updated: 0 },
  NOTIFICATIONS: [],
  VERSION: 0.4,
});

const longviewGetValuesWaiting = longviewResponseFactory.build({
  ACTION: 'getValues',
  DATA: {},
  NOTIFICATIONS: [],
  VERSION: 0.4,
});

const longviewGetLatestValueWaiting = longviewResponseFactory.build({
  ACTION: 'getLatestValue',
  DATA: {},
  NOTIFICATIONS: [],
  VERSION: 0.4,
});

/*
 * Mocks that represent the state of Longview once client is installed and data is received.
 */
const longviewLastUpdatedInstalled = longviewResponseFactory.build({
  ACTION: 'lastUpdated',
  DATA: {
    updated: DateTime.now().plus({ minutes: 1 }).toSeconds(),
  },
  NOTIFICATIONS: [],
  VERSION: 0.4,
});

const longviewGetValuesInstalled = longviewResponseFactory.build({
  ACTION: 'getValues',
  DATA: {
    Packages: longviewPackageFactory.buildList(5),
  },
  NOTIFICATIONS: [],
  VERSION: 0.4,
});

const longviewGetLatestValueInstalled = longviewResponseFactory.build({
  ACTION: 'getLatestValue',
  DATA: longviewLatestStatsFactory.build(),
  NOTIFICATIONS: [],
  VERSION: 0.4,
});

authenticate();
describe('longview', () => {
  before(() => {
    cleanUp(['linodes', 'longview-clients']);
  });

  /*
   * - Tests Longview installation end-to-end using mock API data.
   * - Confirms that Cloud Manager UI updates to reflect Longview installation and data.
   */

  it('can install Longview client on a Linode', () => {
    const client: LongviewClient = longviewClientFactory.build({
      api_key: '01AE82DD-6F99-44F6-95781512B64FFBC3',
      apps: longviewAppsFactory.build(),
      created: new Date().toISOString(),
      id: 338283,
      install_code: '748632FC-E92B-491F-A29D44019039017C',
      label: 'longview-client-longview338283',
      updated: new Date().toISOString(),
    });

    mockGetLongviewClients([client]).as('getLongviewClients');
    mockFetchLongviewStatus(client, 'lastUpdated', longviewLastUpdatedWaiting);
    mockFetchLongviewStatus(client, 'getValues', longviewGetValuesWaiting);
    mockFetchLongviewStatus(
      client,
      'getLatestValue',
      longviewGetLatestValueWaiting
    ).as('fetchLongview');

    const installCommand = getInstallCommand(client.install_code);

    cy.visitWithLogin('/longview');
    cy.wait('@getLongviewClients');

    // Confirm that Longview landing page lists a client that is still waiting for data...
    cy.get(`[data-qa-longview-client="${client.id}"]`)
      .should('be.visible')
      .within(() => {
        cy.findByText(client.label).should('be.visible');
        cy.findByText(client.api_key).should('be.visible');
        cy.contains(installCommand).should('be.visible');
        cy.findByText('Waiting for data...');
      });

    // Update mocks after initial Longview fetch to simulate client installation and data retrieval.
    // The next time Cloud makes a request to the fetch endpoint, data will start being returned.
    // 3 fetches is necessary because the Longview landing page fires 3 requests to the Longview fetch endpoint for each client.
    // See https://github.com/linode/manager/pull/10579#discussion_r1647945160
    cy.wait(['@fetchLongview', '@fetchLongview', '@fetchLongview']).then(() => {
      mockFetchLongviewStatus(
        client,
        'lastUpdated',
        longviewLastUpdatedInstalled
      );
      mockFetchLongviewStatus(client, 'getValues', longviewGetValuesInstalled);
      mockFetchLongviewStatus(
        client,
        'getLatestValue',
        longviewGetLatestValueInstalled
      );
    });

    // Confirms that UI updates to show that data has been retrieved.
    cy.findByText(`${client.label}`).should('be.visible');
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

  /*
   * - Confirms that the landing page empty state message is displayed when no Longview clients are present.
   * - Confirms that UI updates to show the new client when creating one.
   */
  it('displays empty state message when no clients are present and shows the new client when creating one', () => {
    const client: LongviewClient = longviewClientFactory.build();
    mockGetLongviewClients([]).as('getLongviewClients');
    mockCreateLongviewClient(client).as('createLongviewClient');
    mockFetchLongviewStatus(client, 'lastUpdated', longviewLastUpdatedWaiting);
    mockFetchLongviewStatus(client, 'getValues', longviewGetValuesWaiting);
    mockFetchLongviewStatus(
      client,
      'getLatestValue',
      longviewGetLatestValueWaiting
    ).as('fetchLongview');

    cy.visitWithLogin('/longview');
    cy.wait('@getLongviewClients');

    // Confirms that a landing page empty state message is displayed
    cy.findByText(longviewEmptyStateMessage).should('be.visible');
    cy.findByText(longviewAddClientButtonText).should('be.visible');

    ui.button
      .findByTitle(longviewAddClientButtonText)
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.wait('@createLongviewClient');

    // Update mocks after initial Longview fetch to simulate client installation and data retrieval.
    // The next time Cloud makes a request to the fetch endpoint, data will start being returned.
    // 3 fetches is necessary because the Longview landing page fires 3 requests to the Longview fetch endpoint for each client.
    // See https://github.com/linode/manager/pull/10579#discussion_r1647945160
    cy.wait(['@fetchLongview', '@fetchLongview', '@fetchLongview']).then(() => {
      mockFetchLongviewStatus(
        client,
        'lastUpdated',
        longviewLastUpdatedInstalled
      );
      mockFetchLongviewStatus(client, 'getValues', longviewGetValuesInstalled);
      mockFetchLongviewStatus(
        client,
        'getLatestValue',
        longviewGetLatestValueInstalled
      );
    });

    // Confirms that UI updates to show the new client when creating one.
    cy.findByText(`${client.label}`).should('be.visible');
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
