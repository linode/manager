/* eslint-disable sonarjs/no-duplicate-string */
import {
  createLinodeRequestFactory,
  firewallFactory,
  linodeFactory,
  regionFactory,
} from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { createLinode } from '@linode/api-v4';
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
import { randomLabel, randomNumber } from 'support/util/random';
import type { Linode, Region } from '@linode/api-v4';
import { chooseRegions } from 'support/util/regions';

const mockRegions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    id: 'us-central',
    status: 'ok',
    label: 'Dallas, TX',
  }),
  regionFactory.build({
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'uk',
    id: 'eu-west',
    status: 'ok',
    label: 'London, UK',
  }),
  regionFactory.build({
    capabilities: [
      'Linodes',
      'NodeBalancers',
      'Block Storage',
      'Cloud Firewall',
    ],
    country: 'sg',
    id: 'ap-south',
    status: 'ok',
    label: 'Singapore, SG',
  }),
];

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
    cleanUp('firewalls');
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
    cy.findByText('Dallas, TX').should('be.visible');

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
        cy.findByText(`North America: Dallas, TX`).should('be.visible');
        ui.regionSelect.find().click();
        ui.regionSelect.findItemByRegionLabel('Singapore, SG').click();

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
    const [migrationRegionStart, migrationRegionEnd] = chooseRegions(2);
    const firewallLabel = randomLabel();
    const linodePayload = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: migrationRegionStart.id,
    });

    interceptCreateFirewall().as('createFirewall');
    interceptGetFirewalls().as('getFirewalls');

    // Create a Linode, then navigate to the Firewalls landing page.
    cy.defer(createLinode(linodePayload)).then((linode: Linode) => {
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
          cy.findByText('Label')
            .should('be.visible')
            .click()
            .type(firewallLabel);

          cy.findByText('Linodes')
            .should('be.visible')
            .click()
            .type(linode.label);

          ui.autocompletePopper
            .findByTitle(linode.label)
            .should('be.visible')
            .click();

          // Click on the Select again to dismiss the autocomplete popper.
          cy.findByLabelText('Linodes').should('be.visible').click();

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
        cy.findByText('RUNNING');
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
