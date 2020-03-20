export const routes = {
  createLinode: '/linodes/create'
};

const goToByTabText = (url, text) => {
  cy.visit(url);
  return cy.findByText(text).click();
};

/// List of Routes and validator of the route
export const pages = [
  {
    name: 'Linode/Create/Distribution',
    url: `${routes.createLinode}?type=Distributions`,
    assertIsLoaded: () =>
      cy.findByText('Choose a Distribution').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => goToByTabText(routes.createLinode, 'Distributions')
      }
    ]
  },
  {
    name: 'Linode/Create/OCA',
    url: `${routes.createLinode}?type=One-Click`,
    assertIsLoaded: () => cy.findByText('Select App').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => goToByTabText(routes.createLinode, 'One-Click')
      },
      {
        name: 'Create Button',
        go: () => {
          cy.visit('/');
          //   cy.get
          cy.get('[data-qa-add-new-menu-button="true"]').click();
          cy.get('[data-qa-one-click-add-new="true"').click();
        }
      },
      {
        name: 'Nav',
        go: () => {
          cy.visit('/');
          cy.get('[data-qa-one-click-nav-btn="true"]').click();
        }
      }
    ]
  },
  {
    name: 'Linode/Create/FromImages',
    url: `${routes.createLinode}?type=My%20Images&subtype=Images`,
    assertIsLoaded: () => cy.findByText('Choose an Image').should('be.visible')
  },
  {
    name: 'Linode/Create/FromBackup',
    url: `${routes.createLinode}?type=My%20Images&subtype=Backups`,
    assertIsLoaded: () => cy.findByText('Select Backup').should('be.visible')
  },
  {
    name: 'Linode/Create/Clone',
    url: `${routes.createLinode}?type=My%20Images&subtype=Clone%20Linode`,
    assertIsLoaded: () =>
      cy.findByText('Select Linode to Clone From').should('be.visible')
  }
  // '/linodes/create?type=My%20Images&subtype=Account%20StackScripts'
];
