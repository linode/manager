/* eslint-disable sonarjs/no-duplicate-string */
import { linodeFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import { createLinode } from 'support/api/linodes';
import {
  getClick,
  containsClick,
  fbtClick,
  getVisible,
  fbtVisible,
  containsVisible,
} from 'support/helpers';
import { mockGetLinodeDetails } from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { selectRegionString } from 'support/ui/constants';
import { cleanUp } from 'support/util/cleanup';
import { apiMatcher } from 'support/util/intercepts';
import { randomString } from 'support/util/random';

const fakeRegionsData = {
  data: [
    {
      capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
      country: 'us',
      id: 'us-central',
      status: 'ok',
      label: 'Dallas, TX',
    },
    {
      capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
      country: 'uk',
      id: 'eu-west',
      status: 'ok',
      label: 'London, UK',
    },
    {
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
    },
  ],
};

authenticate();
describe('Migrate Linode With Firewall', () => {
  before(() => {
    cleanUp('firewalls');
  });

  it('test migrate flow - mocking all data', () => {
    const fakeLinodeId = 9999;
    const fakeFirewallId = 6666;

    // modify incoming response
    cy.intercept(apiMatcher('networking/firewalls*'), (req) => {
      req.reply((res) => {
        res.send({
          data: [
            {
              id: fakeFirewallId,
              label: 'test',
              created: '2020-08-03T15:49:50',
              updated: '2020-08-03T15:49:50',
              status: 'enabled',
              rules: {
                inbound: [
                  {
                    ports: '80',
                    protocol: 'TCP',
                    addresses: { ipv4: ['0.0.0.0/0'], ipv6: ['::/0'] },
                  },
                ],
                outbound: [
                  {
                    ports: '80',
                    protocol: 'TCP',
                    addresses: { ipv4: ['0.0.0.0/0'], ipv6: ['::/0'] },
                  },
                ],
              },
              tags: [],
              devices: { linodes: [fakeLinodeId] },
            },
          ],
          page: 1,
          pages: 1,
          results: 1,
        });
      });
    }).as('getFirewalls');

    const fakeLinodeData = linodeFactory.build({
      id: fakeLinodeId,
      label: 'debian-us-central',
      group: '',
      status: 'running',
      created: '2020-06-23T16:02:14',
      updated: '2020-06-23T16:05:23',
      type: 'g6-standard-1',
      ipv4: ['104.237.129.173'],
      ipv6: '2600:3c00::f03c:92ff:feeb:98f9/64',
      image: 'linode/debian10',
      region: 'us-central',
      specs: {
        disk: 51200,
        memory: 2048,
        vcpus: 1,
        gpus: 0,
        transfer: 2000,
      },
      alerts: {
        cpu: 90,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
        io: 10000,
      },
      backups: {
        enabled: true,
        schedule: { day: 'Scheduling', window: 'Scheduling' },
        last_successful: '2020-08-02T22:26:19',
      },
      hypervisor: 'kvm',
      watchdog_enabled: true,
      tags: [],
    });

    // modify incoming response
    cy.intercept(apiMatcher('regions*'), (req) => {
      req.reply((res) => {
        res.send(fakeRegionsData);
      });
    }).as('getRegions');

    // intercept request and stub it, respond with 200
    cy.intercept(
      'POST',
      apiMatcher(`linode/instances/${fakeLinodeId}/migrate`),
      {
        statusCode: 200,
      }
    ).as('migrateReq');

    // modify incoming response
    mockGetLinodeDetails(fakeLinodeId, fakeLinodeData).as('getLinode');

    // modify incoming response
    cy.intercept(
      'GET',
      apiMatcher(`linode/instances/${fakeLinodeId}/migrate`),
      (req) => {
        req.reply((res) => {
          res.send(fakeLinodeData);
        });
      }
    ).as('getLinode');

    cy.visitWithLogin(`/linodes/${fakeLinodeId}/migrate`);
    cy.wait('@getLinode');
    cy.wait('@getRegions');
    cy.findByText('Dallas, TX').should('be.visible');
    getClick('[data-qa-checked="false"]');
    cy.findByText(`North America: Dallas, TX`).should('be.visible');
    containsClick(selectRegionString);

    ui.regionSelect.findItemByRegionLabel('Singapore, SG').click();

    fbtClick('Enter Migration Queue');
    cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
  });

  // create linode w/ firewall region then add firewall to it then attempt to migrate linode to non firewall region, should fail
  it('migrates linode with firewall - real data', () => {
    const validateMigration = () => {
      ui.button
        .findByTitle('Enter Migration Queue')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@migrateLinode').its('response.statusCode').should('eq', 200);
    };

    const firewallLabel = `cy-test-firewall-${randomString(5)}`;
    // intercept create firewall request
    cy.intercept('POST', apiMatcher('networking/firewalls')).as(
      'createFirewall'
    );
    // modify incoming response
    cy.intercept(apiMatcher('networking/firewalls*')).as('getFirewalls');

    cy.visitWithLogin('/firewalls');

    createLinode({ region: 'ap-southeast' }).then((linode) => {
      // intercept migrate linode request
      cy.intercept(
        'POST',
        apiMatcher(`linode/instances/${linode.id}/migrate`)
      ).as('migrateLinode');

      getVisible('[data-qa-header]').within(() => {
        fbtVisible('Firewalls');
      });

      cy.wait('@getFirewalls').then(({ response }) => {
        const length = response?.body.data['length'];
        console.log(`THIS: ${length}`);
        getVisible('[data-qa-header]').within(() => {
          fbtVisible('Firewalls');
        });
        fbtClick('Create Firewall');
      });

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

      getClick('[data-qa-submit="true"]');
      cy.wait('@createFirewall');
      cy.visit(`/linodes/${linode.id}`);
      getVisible('[data-qa-link-text="true"]').within(() => {
        fbtVisible('linodes');
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

      containsVisible(`Migrate Linode ${linode.label}`);
      getClick('[data-qa-checked="false"]');
      fbtClick(selectRegionString);

      ui.regionSelect.findItemByRegionLabel('Toronto, CA').click();
      validateMigration();
    });
  });
});
