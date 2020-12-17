/* eslint-disable sonarjs/no-duplicate-string */
import {
  clickLinodeActionMenu,
  createLinode,
  createLinodeSpecifyRegion,
  deleteAllTestLinodes
} from '../../support/api/linodes';
import { deleteFirewallByLabel } from '../../support/api/firewalls';
import { getClick, containsClick, fbtClick } from '../../support/helpers';
import { selectRegionString } from '../../support/ui/constants';

const fakeRegionsData = {
  data: [
    {
      capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
      country: 'uk',
      id: 'eu-west',
      status: 'ok'
    },
    {
      capabilities: [
        'Linodes',
        'NodeBalancers',
        'Block Storage',
        'Cloud Firewall'
      ],
      country: 'sg',
      id: 'ap-south',
      status: 'ok'
    }
  ]
};
describe('Migrate Linode With Firewall', () => {
  // In the upcoming future, API wiull have /linode/instances/{ID}/firewalls
  // when it is the case, the /firewalls request should be replaced by that
  it('test migrate flow - mocking all data, using get all firewalls', () => {
    cy.server();
    // faking firewall 1001
    const fakeFirewallId = 6666;
    const fakeLinodeId = 9999;
    cy.route({
      method: 'GET',
      url: '*/firewalls',
      response: {
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
                  addresses: { ipv4: ['0.0.0.0/0'], ipv6: ['::/0'] }
                }
              ],
              outbound: [
                {
                  ports: '80',
                  protocol: 'TCP',
                  addresses: { ipv4: ['0.0.0.0/0'], ipv6: ['::/0'] }
                }
              ]
            },
            tags: [],
            devices: { linodes: [fakeLinodeId] }
          }
        ],
        page: 1,
        pages: 1,
        results: 1
      }
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
        transfer: 2000
      },
      alerts: {
        cpu: 90,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
        io: 10000
      },
      backups: {
        enabled: true,
        schedule: { day: 'Scheduling', window: 'Scheduling' },
        last_successful: '2020-08-02T22:26:19'
      },
      hypervisor: 'kvm',
      watchdog_enabled: true,
      tags: []
    };

    cy.route({
      method: 'GET',
      url: '*/regions',
      response: fakeRegionsData
    }).as('getRegions');

    cy.route({
      method: 'POST',
      url: `*/linode/instances/${fakeLinodeId}/migrate`,
      response: {}
    }).as('migrateReq');

    cy.route({
      method: 'GET',
      url: `*/linode/instances/*`,
      response: {
        data: [fakeLinodeData],
        page: 1,
        pages: 1,
        results: 1
      }
    }).as('getLinodes');
    cy.route({
      method: 'GET',
      url: `*/linode/instances/${fakeLinodeId}`,
      response: fakeLinodeData
    }).as('getLinode');

    cy.visitWithLogin(`/linodes/${fakeLinodeId}/migrate`);
    cy.findByText('Dallas, TX').should('be.visible');
    getClick('[data-qa-checked="false"]');
    cy.findByText(`United States: Dallas, TX`).should('be.visible');
    containsClick(selectRegionString);
    // checking that eu-west is not selectable
    // TODO uncomment this line once the logic is in the code to check for region with the cloud firewall capabilities
    // cy.findByText('London, UK', { timeout: 1000 }).should('not.exist');
    // checking that ap-south is selectable
    fbtClick('Singapore, SG');
    fbtClick('Enter Migration Queue');
    // this request will succeed because overloaded, we just check it is launched
    cy.wait('@migrateReq')
      .its('status')
      .should('eq', 200);
  });

  // create linode w/ firewall region then add firewall to it then attempt to migrate linode to non firewall region, should fail
  it('Cannot migrate linode with firewall to location w/out firewall - real data, ', () => {
    const firewallLabel = 'testFirewall';
    cy.server();
    cy.route({
      method: 'POST',
      url: `*/networking/firewalls`
    }).as('createFirewall');
    cy.visitWithLogin('/firewalls');
    createLinodeSpecifyRegion('ap-southeast').then(linode => {
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/migrate`
      }).as('migrateLinode');
      fbtClick('Create a Firewall');
      cy.get('[data-testid="textfield-input"]').type(firewallLabel);
      getClick(
        '[data-qa-enhanced-select="Select a Linode or type to search..."]'
      );
      fbtClick(linode.label);
      getClick('[data-qa-submit="true"]');
      cy.wait('@createFirewall');
      cy.visit(`/linodes/${linode.id}`);
      clickLinodeActionMenu(linode.label);
      fbtClick('Migrate');
      getClick('[data-qa-checked="false"]');
      fbtClick(selectRegionString);
      fbtClick('Dallas, TX');
      if (
        cy.contains('PROVISIONING').should('not.be.visible') &&
        cy.contains('BOOTING').should('not.be.visible')
      ) {
        fbtClick('Enter Migration Queue');
      }
      cy.wait('@migrateLinode')
        .its('status')
        .should('eq', 400);
      if (!cy.findByText('Linode busy.').should('not.be.visible')) {
        fbtClick('Enter Migration Queue');
        cy.wait('@migrateLinode')
          .its('status')
          .should('eq', 400);
        if (!cy.findByText('Linode busy.').should('not.be.visible')) {
          fbtClick('Enter Migration Queue');
          cy.wait('@migrateLinode')
            .its('status')
            .should('eq', 400);
        }
        cy.findByText(
          'Target region for this Linode does not support Cloud Firewalls at this time. Please choose a different region or remove your firewall before migrating.'
        ).should('be.visible');
      }
      deleteAllTestLinodes();
      deleteFirewallByLabel(firewallLabel);
    });
  });

  it('Cannot add linode without firewall location firewall - real data, ', () => {
    const firewallLabel = 'testFirewall';
    cy.server();
    cy.route({
      method: 'POST',
      url: `*/networking/firewalls`
    }).as('createFirewall');
    cy.visitWithLogin('/firewalls');
    createLinode().then(linode => {
      cy.route({
        method: 'POST',
        url: `*/linode/instances/${linode.id}/migrate`
      }).as('migrateLinode');
      fbtClick('Create a Firewall');
      cy.get('[data-testid="textfield-input"]').type(firewallLabel);
      getClick(
        '[data-qa-enhanced-select="Select a Linode or type to search..."]'
      );
      cy.contains(linode.label).should('not.be.visible');
    });
  });
});
