import { waitForAppLoad } from './common';

export const loadAppNoLogin = (path: string) => waitForAppLoad(path, false);

/* eslint-disable sonarjs/no-duplicate-string */
export const routes = {
  account: '/account',
  createLinode: '/linodes/create',
  createLinodeOCA: '/linodes/create?type=One-Click',
  linodeLanding: '/linodes',
  profile: '/profile',
  support: '/support',
  supportTickets: '/support/tickets',
  supportTicketsClosed: '/support/tickets/closed',
  supportTicketsOpen: '/support/tickets/open',
};
/**
 * due 2 rerender of the page that i could not deterministically check i added this wait
 * @todo find a better way
 */
const waitDoubleRerender = () => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
};

interface GoWithUI {
  go: () => void;
  name: string;
}

export interface Page {
  assertIsLoaded: () => void;
  goWithUI?: GoWithUI[];
  name: string;
  url: string;
}

// List of Routes and validator of the route
export const pages: Page[] = [
  {
    assertIsLoaded: () => cy.findByText('Choose an OS').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(routes.createLinodeOCA);
          cy.findByText('OS').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Linode/Create/OS',
    url: `${routes.createLinode}?type=OS`,
  },
  {
    assertIsLoaded: () => cy.findByText('Select App').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(routes.createLinode);
          cy.get('[data-reach-tab]').contains('Marketplace').click();
        },
        name: 'Tab',
      },
      {
        go: () => {
          // going to a page that loads easily, not dashboard for faster test
          loadAppNoLogin(routes.support);
          cy.get('[data-qa-add-new-menu-button="true"]')
            .should('be.visible')
            .click();
          cy.get('[data-qa-one-click-add-new="true"]')
            .should('be.visible')
            .click();
        },
        name: 'Create Button',
      },
      {
        go: () => {
          loadAppNoLogin(routes.support);
          cy.findByText('Create').click();
          cy.get('[data-qa-one-click-add-new="true"]').click();
        },
        name: 'Nav',
      },
    ],
    name: 'Linode/Create/OCA',
    url: routes.createLinodeOCA,
  },
  {
    assertIsLoaded: () => cy.findByText('Choose an Image').should('be.visible'),
    name: 'Linode/Create/FromImages',
    url: `${routes.createLinode}?type=Images`,
  },
  {
    assertIsLoaded: () => cy.findByText('Select Backup').should('be.visible'),
    name: 'Linode/Create/FromBackup',
    url: `${routes.createLinode}?type=Backups`,
  },
  {
    assertIsLoaded: () =>
      cy.findByText('Select Linode to Clone From').should('be.visible'),
    name: 'Linode/Create/Clone',
    url: `${routes.createLinode}?type=Clone%20Linode`,
  },
  {
    assertIsLoaded: () => cy.findByText('My Profile').should('be.visible'),
    name: 'Profile',
    url: `${routes.profile}`,
  },
  {
    assertIsLoaded: () => cy.findByText('Username').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          const url = `${routes.profile}/auth`;
          loadAppNoLogin(url);
          cy.get('[data-qa-header="My Profile"]').should('be.visible');
          cy.contains(
            'How to Enable Third Party Authentication on Your User Account'
          ).should('be.visible');
          waitDoubleRerender();
          cy.contains('Display').should('be.visible').click();
        },
        name: 'Tab',
      },
      {
        go: () => {
          loadAppNoLogin(routes.support);
          cy.findByTestId('nav-group-profile').click();
          cy.findByTestId('menu-item-Display')
            .should('have.text', 'Display')
            .click({ force: true });
        },
        name: 'User Profile Button',
      },
    ],
    name: 'Profile/Display',
    url: `${routes.profile}/display`,
  },
  {
    assertIsLoaded: () =>
      cy.findByText('Account Password').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(routes.profile);
          cy.findByText('Username').should('be.visible');
          waitDoubleRerender();
          cy.contains('Login & Authentication').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Profile/Password',
    url: `${routes.profile}/auth`,
  },
  {
    assertIsLoaded: () => cy.findByText('Add an SSH Key').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(routes.profile);
          cy.findByText('Username');
          waitDoubleRerender();
          cy.contains('SSH Keys').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Profile/SSH Keys',
    url: `${routes.profile}/keys`,
  },
  {
    assertIsLoaded: () =>
      cy.findByText('Authentication Mode').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(routes.profile);
          cy.findByText('Username');
          waitDoubleRerender();
          cy.contains('LISH Console Settings').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Profile/LISH',
    url: `${routes.profile}/lish`,
  },
  {
    assertIsLoaded: () =>
      cy.findByText('Add a Personal Access Token').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(routes.profile);
          cy.findByText('Username');
          waitDoubleRerender();
          cy.contains('API Tokens').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Profile/API Tokens',
    url: `${routes.profile}/tokens`,
  },
  {
    assertIsLoaded: () =>
      cy.findByText('Other Ways to Get Help').should('be.visible'),
    name: 'Support',
    url: `${routes.support}`,
  },
  {
    assertIsLoaded: () => cy.findByText('Open New Ticket').should('be.visible'),
    name: 'Support/Tickets',
    url: `${routes.supportTickets}`,
  },
  {
    assertIsLoaded: () => cy.findByText('Open New Ticket').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(routes.supportTicketsOpen);
          cy.findByText('Open Tickets').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Support/Tickets/Open',
    url: `${routes.supportTicketsOpen}`,
  },
  {
    assertIsLoaded: () => cy.findByText('Open New Ticket').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(routes.supportTicketsClosed);
          cy.findByText('Closed Tickets').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Support/Tickets/Closed',
    url: `${routes.supportTicketsClosed}`,
  },
  {
    assertIsLoaded: () => cy.findByText('Billing Info').should('be.visible'),
    name: 'Account',
    url: `${routes.account}`,
  },
  {
    assertIsLoaded: () =>
      cy.findByText('Update Contact Information').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(`${routes.account}/users`);
          cy.findByText('Username');
          waitDoubleRerender();
          cy.findByText('Billing Info').should('be.visible').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Account/Billing',
    url: `${routes.account}/billing`,
  },
  {
    assertIsLoaded: () => cy.findByText('Add a User').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(`${routes.account}/billing`);
          cy.findByText('Billing Contact');
          waitDoubleRerender();
          cy.get('[data-reach-tab]').contains('Users').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Account/Users',
    url: `${routes.account}/users`,
  },
  {
    assertIsLoaded: () =>
      cy.findByText('Backup Auto Enrollment').should('be.visible'),
    goWithUI: [
      {
        go: () => {
          loadAppNoLogin(`${routes.account}/billing`);
          cy.findByText('Billing Contact');
          waitDoubleRerender();
          cy.contains('Settings').click();
        },
        name: 'Tab',
      },
    ],
    name: 'Account/Settings',
    url: `${routes.account}/settings`,
  },
];
