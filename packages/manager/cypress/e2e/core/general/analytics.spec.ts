import { ui } from 'support/ui';

const ADOBE_LAUNCH_URLS = [
  'https://assets.adobedtm.com/fcfd3580c848/15e23aa7fce2/launch-92311d9d9637-development.min.js', // New dev Launch script
  'https://assets.adobedtm.com/fcfd3580c848/15e23aa7fce2/launch-5bda4b7a1db9-staging.min.js', // New staging Launch script
  'https://assets.adobedtm.com/fcfd3580c848/15e23aa7fce2/launch-9ea21650035a.min.js', // New prod Launch script
];

describe('Script loading and user interaction test', () => {
  beforeEach(() => {
    cy.visitWithLogin('/');
  });

  it("checks if each environment's Adobe Launch script is loaded and the page is responsive to user interaction", () => {
    cy.tag('purpose:syntheticTesting');

    for (const url of ADOBE_LAUNCH_URLS) {
      cy.then(() => {
        cy.window().then((window) => {
          return new Promise<void>((resolve, reject) => {
            // Load the Adobe Launch script
            const script = window.document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = reject;
            window.document.head.appendChild(script);
          });
        });

        // Wait for Adobe to initialize and confirm _satellite object
        cy.window().should(({ _satellite }) => {
          expect(_satellite).to.exist;
          expect(_satellite?.track).to.be.a('function');
          // Log to easily verify object
          console.log(url, _satellite);
        });

        // Test out a few UI interactions (navigation, keyboard input) and confirm Cloud Manager is functional
        ui.nav
          .findItemByTitle('Help & Support')
          .scrollIntoView()
          .should('be.visible')
          .click();

        ui.autocomplete.findByLabel('Search for answers').type('linode');
        cy.findByText('Search for "linode"').should('be.visible');

        ui.userMenuButton.find().click();
        ui.userMenu
          .find()
          .should('be.visible')
          .within(() => {
            cy.findByText('Display').should('be.visible').click();
          });

        cy.url().should('endWith', '/profile/display');
        cy.reload();
      });
    }
  });
});
