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
import { selectRegionString } from 'support/ui/constants';
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

authenticate();
describe('Migrate Linode With Firewall', () => {
  before(() => {
    cleanUp('firewalls');
  });

  /*
   * - Tests Linode migration flow for Linodes with Firewalls using mock API data.
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
      devices: {
        linodes: [mockLinode.id],
      },
    });

    mockGetFirewalls([mockFirewall]).as('getFirewalls');
    mockGetLinodeDetails(mockLinode.id, mockLinode).as('getLinode');
    mockGetRegions(mockRegions).as('getRegions');
    mockMigrateLinode(mockLinode.id).as('migrateReq');

    cy.visitWithLogin(`/linodes/${mockLinode.id}/migrate`);
    cy.wait(['@getLinode', '@getRegions']);
    cy.findByText('Dallas, TX').should('be.visible');
    cy.get('[data-qa-checked="false"]').click();
    cy.findByText(`North America: Dallas, TX`).should('be.visible');
    cy.contains(selectRegionString).click();

    ui.regionSelect.findItemByRegionLabel('Singapore, SG').click();

    cy.findByText('Enter Migration Queue').click();
    cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
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

    cy.defer(createLinode(linodePayload)).then((linode: Linode) => {
      interceptMigrateLinode(linode.id).as('migrateLinode');
      cy.visitWithLogin('/firewalls');
      // intercept migrate linode request

      cy.get('[data-qa-header]')
        .should('be.visible')
        .within(() => {
          cy.findByText('Firewalls').should('be.visible');
        });

      cy.wait('@getFirewalls');
      cy.get('[data-qa-header]')
        .should('be.visible')
        .within(() => {
          cy.findByText('Firewalls').should('be.visible');
        });
      cy.findByText('Create Firewall').click();

      cy.get('[data-testid="textfield-input"]:first')
        .should('be.visible')
        .type(firewallLabel);

      cy.get('[data-testid="textfield-input"]:last')
        .should('be.visible')
        .click()
        .type(linode.label);

      cy.get('[data-qa-autocomplete-popper]')
        .findByText(linode.label)
        .should('be.visible')
        .click();

      cy.get('[data-testid="textfield-input"]:last')
        .should('be.visible')
        .click();

      cy.findByText(linode.label).should('be.visible');

      cy.get('[data-qa-submit="true"]').click();
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

      cy.contains(`Migrate Linode ${linode.label}`).should('be.visible');
      cy.get('[data-qa-checked="false"]').click();
      cy.findByText(selectRegionString).click();

      ui.regionSelect.findItemByRegionLabel(migrationRegionEnd.label).click();
      ui.button
        .findByTitle('Enter Migration Queue')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@migrateLinode').its('response.statusCode').should('eq', 200);
    });
  });
});
