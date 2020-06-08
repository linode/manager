import { makeLinodeDataWithStatus } from '../support/api/linodes';

describe('Checking icons render correctly', () => {
  describe('Linode icon status', () => {
    const linodeIconStatus = [
      {
        status: 'running',
        ariaLabel: 'linode is running',
        name: 'linode-running'
      },
      {
        status: 'offline',
        ariaLabel: 'linode is offline',
        name: 'linode-offline'
      }
    ];
    linodeIconStatus.forEach(s => {
      return it(`${s.name}`, () => {
        // not creating any linode, simply mocking them
        cy.server();
        cy.route({
          url: '*/linode/instances/*',
          method: 'GET',
          response: {
            data: [makeLinodeDataWithStatus(s.status)]
          }
        }).as('getLinodes');

        cy.visitWithLogin('/linodes');
        // this test works because the icon is fully rendered on the screen
        cy.get(`[aria-label="${s.ariaLabel}"]`)
          .first()
          .should('be.visible')
          .checkSnapshot(s.ariaLabel)
          .should('be.true');
      });
    });
  });
  describe('Linodes Landing List Icons', () => {
    const linodeLandingIcons = [
      {
        name: 'button-list-view',
        selector: 'button[data-qa-view="list"'
      },
      {
        name: 'button-grid-view',
        selector: 'button[data-qa-view="grid"'
      }
    ];
    linodeLandingIcons.forEach(i => {
      return it(`${i.name}`, () => {
        // here we mock to avoid being on No linode list
        cy.server();
        cy.route({
          url: '*/linode/instances/*',
          method: 'GET',
          response: {
            data: [makeLinodeDataWithStatus('running')]
          }
        }).as('getLinodes');
        cy.visitWithLogin('/linodes');
        cy.get(i.selector)
          .should('be.visible')
          .click()
          .checkSnapshot(i.name)
          .should('be.true');
      });
    });
  });
});
