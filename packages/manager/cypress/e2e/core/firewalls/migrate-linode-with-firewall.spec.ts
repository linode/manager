/* eslint-disable sonarjs/no-duplicate-string */
import {
  createLinodeRequestFactory,
  linodeFactory,
  regionFactory,
} from '@linode/utilities';
import { firewallFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  interceptCreateFirewall,
  interceptGetFirewalls,
  mockGetFirewalls,
} from 'support/intercepts/firewalls';
import {
  interceptMigrateLinode,
  mockGetLinodeDetails,
  mockMigrateLinode,
} from 'support/intercepts/linodes';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegions, extendRegion } from 'support/util/regions';

import type { Linode, Region } from '@linode/api-v4';

const mockDallas = extendRegion(
  regionFactory.build({
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    id: 'us-central',
    label: 'Dallas, TX',
    status: 'ok',
  })
);

const mockLondon = extendRegion(
  regionFactory.build({
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'uk',
    id: 'eu-west',
    label: 'London, UK',
    status: 'ok',
  })
);

const mockSingapore = extendRegion(
  regionFactory.build({
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Cloud Firewall',
    ],
    country: 'sg',
    id: 'ap-south',
    label: 'Singapore, SG',
    status: 'ok',
  })
);

const mockRegions: Region[] = [mockDallas, mockLondon, mockSingapore];

// Migration notes and warnings that are shown to the user.
// We want to confirm that these are displayed so that users are not surprised
// by migration side effects.
const migrationNoticeSubstrings = [
  'assigned new IPv4 and IPv6 addresses',
  'existing backups with the Linode Backup Service will not be migrated',
  'DNS records (including Reverse DNS) will need to be updated',
  'attached VLANs will be inaccessible if the destination region does not support VLANs',
  'Your Linode will be powered off.',
];

authenticate();
describe('Migrate Linode With Firewall', () => {
  before(() => {
    cleanUp(['firewalls', 'linodes']);
  });

  /*
   * - Tests Linode migration flow for Linodes with Firewalls using mock API data.
   * - Confirms that user is warned of migration consequences.
   */
  it('test migrate flow - mocking all data', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: 'us-central',
    });

    const mockFirewall = firewallFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      status: 'enabled',
    });

    mockGetFirewalls([mockFirewall]).as('getFirewalls');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetRegions(mockRegions).as('getRegions');
    mockMigrateLinode(mockLinode.id).as('migrateLinode');

    cy.visitWithLogin(`/linodes/${mockLinode.id}/migrate`);
    cy.wait(['@getLinode', '@getRegions']);
    cy.findByText(mockDallas.label).should('be.visible');

    ui.dialog
      .findByTitle(`Migrate Linode ${mockLinode.label} to another region`)
      .should('be.visible')
      .within(() => {
        // Confirm that 'Enter Migration Queue' button is disabled.
        ui.button
          .findByTitle('Enter Migration Queue')
          .should('be.visible')
          .should('be.disabled');

        // Confirm that user is warned of Migration side effects.
        cy.findByText('Caution:').should('be.visible');
        migrationNoticeSubstrings.forEach((noticeSubstring: string) => {
          cy.contains(noticeSubstring).should('be.visible');
        });

        // Click the "Accept" check box.
        cy.findByText('Accept').should('be.visible').click();

        // Select migration region.
        cy.findByText(`North America: ${mockDallas.label}`).should(
          'be.visible'
        );
        ui.regionSelect.find().click();
        ui.regionSelect
          .findItemByRegionLabel(mockSingapore.label, mockRegions)
          .click();

        ui.button
          .findByTitle('Enter Migration Queue')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@migrateLinode').its('response.statusCode').should('eq', 200);
  });

  /*
   * - Uses real API data to create a Firewall, attach a Linode to it, then migrate the Linode.
   */
  it('migrates linode with firewall - real data', () => {
    cy.tag('method:e2e', 'purpose:dcTesting', 'env:multipleRegions');
    // Execute the body of the test inside Cypress's command queue to ensure
    // that logic that requires multiple regions only executes after tags are evaluated.
    cy.defer(async () => {}).then(() => {
      const [migrationRegionStart, migrationRegionEnd] = chooseRegions(2);
      const firewallLabel = randomLabel();
      const linodePayload = createLinodeRequestFactory.build({
        label: randomLabel(),
        region: migrationRegionStart.id,
      });

      interceptCreateFirewall().as('createFirewall');
      interceptGetFirewalls().as('getFirewalls');

      // Create a Linode, then navigate to the Firewalls landing page.
      cy.defer(() =>
        createTestLinode(linodePayload, { securityMethod: 'powered_off' })
      ).then((linode: Linode) => {
        interceptMigrateLinode(linode.id).as('migrateLinode');
        cy.visitWithLogin('/firewalls');
        cy.wait('@getFirewalls');

        ui.button
          .findByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.drawer
          .findByTitle('Create Firewall')
          .should('be.visible')
          .within(() => {
            cy.findByText('Label').should('be.visible').click();
            cy.focused().type(firewallLabel);

            cy.findByText('Linodes').should('be.visible').click();
            cy.focused().type(linode.label);

            ui.autocompletePopper
              .findByTitle(linode.label)
              .should('be.visible')
              .click();

            // Dismiss the autocomplete popper.
            cy.focused().type('{esc}');

            ui.buttonGroup
              .findButtonByTitle('Create Firewall')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        cy.wait('@createFirewall');
        cy.visitWithLogin(`/linodes/${linode.id}`);
        cy.get('[data-qa-link-text="true"]')
          .should('be.visible')
          .within(() => {
            cy.findByText('linodes').should('be.visible');
          });

        // Make sure Linode is running before attempting to migrate.
        cy.get('[data-qa-linode-status]').within(() => {
          cy.findByText('OFFLINE');
        });

        ui.actionMenu
          .findByTitle(`Action menu for Linode ${linode.label}`)
          .should('be.visible')
          .click();

        ui.actionMenuItem.findByTitle('Migrate').should('be.visible').click();

        ui.dialog
          .findByTitle(`Migrate Linode ${linode.label} to another region`)
          .should('be.visible')
          .within(() => {
            // Click "Accept" check box.
            cy.findByText('Accept').should('be.visible').click();

            // Select region for migration.
            ui.regionSelect.find().click();
            ui.regionSelect
              .findItemByRegionLabel(migrationRegionEnd.label)
              .click();

            // Initiate migration.
            ui.button
              .findByTitle('Enter Migration Queue')
              .should('be.visible')
              .should('be.enabled')
              .click();
          });

        cy.wait('@migrateLinode').its('response.statusCode').should('eq', 200);
      });
    });
  });
});
