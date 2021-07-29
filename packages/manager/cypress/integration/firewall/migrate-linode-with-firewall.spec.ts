/* eslint-disable sonarjs/no-duplicate-string */
import { clickLinodeActionMenu, createLinode } from '../../support/api/linodes';
import { deleteFirewallByLabel } from '../../support/api/firewalls';
import {
  getClick,
  containsClick,
  fbtClick,
  getVisible,
  fbtVisible,
  containsVisible,
} from '../../support/helpers';
import { selectRegionString } from '../../support/ui/constants';

const fakeRegionsData = {
  data: [
    {
      capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
      country: 'uk',
      id: 'eu-west',
      status: 'ok',
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
    },
  ],
};

describe('Migrate Linode With Firewall', () => {
  it('test migrate flow - mocking all data', () => {
    const fakeLinodeId = 9999;
    const fakeFirewallId = 6666;

    // modify incoming response
    cy.intercept('*/networking/firewalls*', (req) => {
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

    const fakeLinodeData = {
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
    };

    // modify incoming response
    cy.intercept('*/regions', (req) => {
      req.reply((res) => {
        res.send(fakeRegionsData);
      });
    }).as('getRegions');

    // intercept request and stub it, respond with 200
    cy.intercept('POST', `*/linode/instances/${fakeLinodeId}/migrate`, {
      statusCode: 200,
    }).as('migrateReq');

    // modify incoming response
    cy.intercept('*/linode/instances/*', (req) => {
      req.reply((res) => {
        res.send({
          data: [fakeLinodeData],
          page: 1,
          pages: 1,
          results: 1,
        });
      });
    }).as('getLinodes');

    // modify incoming response
    cy.intercept(`*/linode/instances/${fakeLinodeId}/migrate`, (req) => {
      req.reply((res) => {
        res.send(fakeLinodeData);
      });
    }).as('getLinode');

    cy.visitWithLogin(`/linodes/${fakeLinodeId}/migrate`);
    cy.wait('@getLinodes');
    cy.wait('@getRegions');
    cy.findByText('Dallas, TX').should('be.visible');
    getClick('[data-qa-checked="false"]');
    cy.findByText(`United States: Dallas, TX`).should('be.visible');
    containsClick(selectRegionString);
    fbtClick('Singapore, SG');
    fbtClick('Enter Migration Queue');
    cy.wait('@migrateReq').its('response.statusCode').should('eq', 200);
  });

  // create linode w/ firewall region then add firewall to it then attempt to migrate linode to non firewall region, should fail
  it('Cannot migrate linode with firewall to location w/out firewall - real data, ', () => {
    const validateBlockedMigration = () => {
      getVisible('[type="button"]').within(() => {
        containsClick('Enter Migration Queue');
      });
      cy.wait('@migrateLinode').its('response.statusCode').should('eq', 400);
      cy.findByText(
        'Target region for this Linode does not support Cloud Firewalls at this time. Please choose a different region or remove your firewall before migrating.',
        { timeout: 180000 }
      ).should('be.visible');
    };

    const firewallLabel = 'cy-test-firewall';
    // intercept create firewall request
    cy.intercept('POST', `*/networking/firewalls`).as('createFirewall');
    // modify incoming response
    cy.intercept('*/networking/firewalls*').as('getFirewalls');

    cy.visitWithLogin('/firewalls');

    createLinode({ region: 'ap-southeast' }).then((linode) => {
      // intercept migrate linode request
      cy.intercept('POST', `*/linode/instances/${linode.id}/migrate`).as(
        'migrateLinode'
      );

      getVisible('[data-qa-header]').within(() => {
        fbtVisible('Firewalls');
      });

      cy.wait('@getFirewalls').then(({ response }) => {
        const length = response?.body.data['length'];
        console.log(`THIS: ${length}`);
        getVisible('[data-qa-header]').within(() => {
          fbtVisible('Firewalls');
        });

        if (length != undefined && length > 0) {
          fbtClick('Create Firewall');
        } else {
          fbtClick('Add a Firewall');
        }
      });

      cy.get('[data-testid="textfield-input"]').type(firewallLabel);
      getVisible(
        '[data-qa-enhanced-select="Select a Linode or type to search..."]'
      );

      getClick(
        '[data-qa-enhanced-select="Select a Linode or type to search..."]'
      );

      fbtClick(linode.label);
      getClick('[data-qa-submit="true"]');
      cy.wait('@createFirewall');
      cy.visit(`/linodes/${linode.id}`);
      getVisible('[data-qa-link-text="true"]').within(() => {
        fbtVisible('linodes');
      });

      if (
        cy.contains('PROVISIONING', { timeout: 180000 }).should('not.exist') &&
        cy.contains('BOOTING', { timeout: 180000 }).should('not.exist')
      ) {
        clickLinodeActionMenu(linode.label);
        fbtClick('Migrate');
        containsVisible(`Migrate Linode ${linode.label}`);
        getClick('[data-qa-checked="false"]');
        fbtClick(selectRegionString);
        fbtClick('Newark, NJ');
        validateBlockedMigration();

        if (!cy.findByText('Linode busy.').should('not.exist')) {
          validateBlockedMigration();
        }

        deleteFirewallByLabel(firewallLabel);
      }
    });
  });

  it('Cannot add linode without firewall location firewall - real data, ', () => {
    const firewallLabel = 'cy-test-firewall';
    // intercept create firewall request
    cy.intercept('POST', '*/networking/firewalls').as('createFirewall');
    // modify incoming response
    cy.intercept('*/networking/firewalls*').as('getFirewall');
    cy.visitWithLogin('/firewalls');
    createLinode().then((linode) => {
      // intercept migrate linode request
      cy.intercept('POST', `*/linode/instances/${linode.id}/migrate`).as(
        'migrateLinode'
      );
      cy.wait('@getFirewall').then(({ response }) => {
        const length = response?.body.data['length'];
        getVisible('[data-qa-header]').within(() => {
          fbtVisible('Firewalls');
        });

        if (length != undefined && length > 0) {
          fbtClick('Create Firewall');
        } else {
          fbtClick('Add a Firewall');
        }
      });
      cy.get('[data-testid="textfield-input"]').type(firewallLabel);
      getClick(
        '[data-qa-enhanced-select="Select a Linode or type to search..."]'
      );
      cy.contains(linode.label).should('not.exist');
    });
  });
});
