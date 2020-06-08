import { waitForAppLoad } from './common';

const loadAppNoLogin = path => waitForAppLoad(path, false);

/* eslint-disable sonarjs/no-duplicate-string */
export const routes = {
  createLinode: '/linodes/create',
  createLinodeOCA: '/linodes/create?type=One-Click',
  support: '/support',
  account: '/account',
  supportTickets: '/support/tickets',
  profile: '/profile'
};

// List of Routes and validator of the route
export const pages = [
  {
    name: 'Linode/Create/Distribution',
    url: `${routes.createLinode}?type=Distributions`,
    assertIsLoaded: () =>
      cy.findByText('Choose a Distribution').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          loadAppNoLogin(routes.createLinodeOCA);
          cy.findByText('Create From:');
          cy.findByText('Distributions').click();
        }
      }
    ]
  },
  {
    name: 'Linode/Create/OCA',
    url: routes.createLinodeOCA,
    assertIsLoaded: () => cy.findByText('Select App').should('be.visible'),
    goWithUI: [
      {
        name: 'Tab',
        go: () => {
          loadAppNoLogin(routes.createLinode);
          cy.findByText('Choose a Distribution');
          cy.findByText('One-Click').click();
        }
      },
      {
        name: 'Create Button',
        go: () => {
          loadAppNoLogin(routes.profile);
          cy.get('[data-qa-add-new-menu-button="true"]')
            .should('be.visible')
            .click();
          cy.get('[data-qa-one-click-add-new="true"]')
            .should('be.visible')
            .click();
        }
      },
      {
        name: 'Nav',
        go: () => {
          loadAppNoLogin(routes.support);
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
          const url = `${routes.profile}/auth`;
          loadAppNoLogin(url);
          cy.findByText('Password Reset').should('be.visible');
          cy.findByText('Display').should('be.visible').click();
        }
      },
      {
        name: 'User Profile Button',
        go: () => {
          loadAppNoLogin(routes.support);
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
          loadAppNoLogin(routes.profile);
          cy.findByText('Username').should('be.visible');
          cy.get('[data-qa-tab="Password & Authentication"]').click();
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
          loadAppNoLogin(routes.profile);
          cy.findByText('Username');
          cy.findByText('SSH Keys').click();
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
          loadAppNoLogin(routes.profile);
          cy.findByText('Username');
          cy.findByText('LISH').click();
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
          loadAppNoLogin(routes.profile);
          cy.findByText('Username');
          cy.findByText('API Tokens').click();
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
          loadAppNoLogin(routes.supportTickets);
          cy.findByText('Open Tickets').click();
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
        name: 'Tab',
        go: () => {
          loadAppNoLogin(routes.supportTickets);
          cy.findByText('Closed Tickets').click();
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
          loadAppNoLogin(`${routes.account}/users`);
          cy.findByText('Username');
          cy.findByText('Billing Info')
            .should('be.visible')
            .click();
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
          loadAppNoLogin(routes.account);
          cy.findByText('Billing Contact');
          cy.findByText('Users').click();
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
          loadAppNoLogin(routes.account);
          cy.findByText('Billing Contact');
          cy.findByText('Settings').click();
        }
      }
    ]
  }
];
