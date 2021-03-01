describe.skip('Checking icons render correctly', () => {
  describe('Linode icon status', () => {
    const linodeIconStatus = [
      {
        status: 'running',
        name: 'linode-running',
      },
      {
        status: 'offline',
        name: 'linode-offline',
      },
    ];
    linodeIconStatus.forEach((s) => {
      return it(`${s.name}`, () => {
        // not creating any linode, simply mocking them
        cy.server();
        cy.route({
          url: '*/linode/instances/*',
          method: 'GET',
          response: {
            data: [makeLinodeDataWithStatus(s.status)],
          },
        }).as('getLinodes');

        cy.visitWithLogin('/linodes');
        // this test works because the icon is fully rendered on the screen
        cy.get('td[data-qa-status="true"]')
          .first()
          .should('be.visible')
          .checkSnapshot(s.name)
          .should('be.true');
      });
    });
  });
  describe('Linodes Landing List Icons', () => {
    const linodeLandingIcons = [
      {
        name: 'Running-Total',
        selector() {
          return cy.findByText('1 RUNNING');
        },
      },
      {
        name: 'Docs-View',
        text: 'Docs',
        selector() {
          return cy.get('[data-qa-icon-text-link="Docs"]');
        },
      },
    ];
    linodeLandingIcons.forEach((i) => {
      return it(`${i.name}`, () => {
        // here we mock to avoid being on No linode list
        cy.server();
        cy.route({
          url: '*/linode/instances/*',
          method: 'GET',
          response: {
            // data: [makeLinodeDataWithStatus('running')]
          },
        }).as('getLinodes');
        cy.visitWithLogin('/linodes');
        i.selector()
          .first()
          .should('be.visible')
          .checkSnapshot(i.name)
          .should('be.true');
      });
    });
  });
});
