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
  it('Cannot migrate - mocking all data, using get all firewalls', () => {
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

    cy.visitWithLogin(`/linodes/${fakeLinodeId}`);
    cy.findByText('Dallas, TX').click();
    cy.findByText('Accept').click();
    cy.findByText(`United States: Dallas, TX`).should('be.visible');
    cy.findByText('Regions').click();
    // cheking that eu-west is not selectable
    // TODO: uncoimment this line once the logic is in the code to check for region with the cloud firewall capabilities
    // cy.findByText('London, UK', {timeout:1000}).should('not.exist')
    // checking that ap-south is selectable
    cy.findByText('Singapore, SG').click();
    cy.findByText('Enter Migration Queue').click();
    // this request will succeed because overloaded, we just check it is launched
    cy.wait('@migrateReq')
      .its('status')
      .should('eq', 200);
  });
});
