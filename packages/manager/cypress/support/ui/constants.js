export const routes = {
  createLinode: '/linodes/create',
  support: '/support',
  account: '/account',
  supportTickets: '/support/tickets',
  profile: '/profile'
};

const goToByTabText = (url, text, isSelector = false) => {
  cy.visit(url);

  (isSelector ? cy.get : cy.findByText)(text)
    .should('be.visible')
    .click();
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
  },
  // '/linodes/create?type=My%20Images&subtype=Account%20StackScripts'
  {
    name: 'Profile',
    url: `${routes.profile}`,
    assertIsLoaded: () => cy.findByText('My Profile').should('be.visible')
  },
  {
    name: 'Profile/Display',
    url: `${routes.profile}/display`,
    assertIsLoaded: () => cy.findByText('Username').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          goToByTabText(
            `${routes.profile}/auth`,
            '[data-qa-tab="Display"]',
            true
          );
        }
      },
      {
        name: 'User Profile Button',
        go: () => {
          cy.visit('/');
          cy.get('[data-qa-user-menu="true"]').click();
          cy.findByText('My Profile').click();
        }
      }
    ]
  },
  {
    name: 'Profile/Password',
    url: `${routes.profile}/auth`,
    assertIsLoaded: () =>
      cy.findByText('Account Password').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          // goToByTabText(routes.profile, 'Password & Authentication');
          goToByTabText(
            routes.profile,
            '[data-qa-tab="Password & Authentication"]',
            true
          );
        }
      }
    ]
  },
  {
    name: 'Profile/SSH Keys',
    url: `${routes.profile}/keys`,
    assertIsLoaded: () => cy.findByText('Add a SSH Key').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          // goToByTabText(routes.profile, 'SSH Keys');

          goToByTabText(routes.profile, '[data-qa-tab="SSH Keys"]', true);
        }
      }
    ]
  },
  {
    name: 'Profile/LISH',
    url: `${routes.profile}/lish`,
    assertIsLoaded: () =>
      cy.findByText('Authentication Mode').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          // goToByTabText(routes.profile, 'LISH');
          goToByTabText(routes.profile, '[data-qa-tab="LISH"]', true);
        }
      }
    ]
  },
  {
    name: 'Profile/API tokens',
    url: `${routes.profile}/tokens`,
    assertIsLoaded: () =>
      cy.findByText('Add a Personal Access Token').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          // goToByTabText(routes.profile, 'API Tokens');
          goToByTabText(routes.profile, '[data-qa-tab="API Tokens"]', true);
        }
      }
    ]
  },
  {
    name: 'Support',
    url: `${routes.support}`,
    assertIsLoaded: () =>
      cy.findByText('Other Ways to Get Help').should('be.visible')
  },
  {
    name: 'Support/tickets',
    url: `${routes.supportTickets}`,
    assertIsLoaded: () => cy.findByText('Open New Ticket').should('be.visible')
  },
  {
    name: 'Support/tickets/open',
    url: `${routes.supportTickets}?type=open`,
    assertIsLoaded: () => cy.findByText('Open New Ticket').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          goToByTabText(routes.supportTickets, 'Open Tickets');
        }
      }
    ]
  },
  {
    name: 'Support/tickets',

    url: `${routes.supportTickets}?type=closed`,
    assertIsLoaded: () => cy.findByText('Open New Ticket').should('be.visible'),
    goWithUI: [
      {
        name: 'Create Button',
        go: () => {
          goToByTabText(routes.supportTickets, 'Closed Tickets');
        }
      }
    ]
  },
  {
    name: 'Account',
    url: `${routes.account}`,
    assertIsLoaded: () => cy.findByText('Billing Info').should('be.visible')
  },
  {
    name: 'Account/Billing',
    url: `${routes.account}/billing`,
    assertIsLoaded: () =>
      cy.findByText('Update Contact Information').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          goToByTabText(
            `${routes.account}/users`,
            '[data-qa-tab="Billing Info"]',
            true
          );
        }
      }
    ]
  },
  {
    name: 'account/Users',
    url: `${routes.account}/users`,
    assertIsLoaded: () => cy.findByText('Add a User').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          goToByTabText(routes.account, '[data-qa-tab="Users"]', true);
        }
      }
    ]
  },
  {
    name: 'account/Settings',
    url: `${routes.account}/settings`,
    assertIsLoaded: () =>
      cy.findByText('Backup Auto Enrollment').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          goToByTabText(routes.account, '[data-qa-tab="Settings"]', true);
        }
      }
    ]
  }
];
