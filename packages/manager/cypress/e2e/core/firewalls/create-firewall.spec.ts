import { createLinode } from '@linode/api-v4/lib/linodes';
import { createLinodeRequestFactory } from 'src/factories/linodes';
import { authenticate } from 'support/api/authentication';
import { containsClick, getClick } from 'support/helpers';
import { interceptCreateFirewall } from 'support/intercepts/firewalls';
import { randomString, randomLabel } from 'support/util/random';
import { ui } from 'support/ui';
import { chooseRegion } from 'support/util/regions';
import { cleanUp } from 'support/util/cleanup';

authenticate();
describe('create firewall', () => {
  before(() => {
    cleanUp(['linodes', 'firewalls']);
  });

  /*
   * - Creates a firewall that is not assigned to a Linode.
   * - Confirms that an error message appears upon submitting without a label.
   * - Confirms that firewall is listed correctly on firewalls landing page.
   */
  it('creates a firewall without a linode', () => {
    const firewall = {
      label: randomLabel(),
      region: chooseRegion().id,
    };

    interceptCreateFirewall().as('createFirewall');
    cy.visitWithLogin('/firewalls/create');

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        // An error message appears when attempting to create a Firewall without a label
        getClick('[data-testid="submit"]');
        cy.findByText('Label is required.');
        // Fill out and submit firewall create form.
        containsClick('Label').type(firewall.label);
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.wait('@createFirewall');

    // Confirm redirect to landing page and that new firewall is listed.
    cy.url().should('endWith', '/firewalls');
    cy.findByText(firewall.label)
      .closest('tr')
      .within(() => {
        cy.findByText(firewall.label).should('be.visible');
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('No rules').should('be.visible');
        cy.findByText('None assigned').should('be.visible');
      });
  });

  /*
   * - Creates a firewall that is assigned to an existing Linode.
   * - Confirms that firewall is listed correctly on firewalls landing page.
   * - Confirms that firewall is assigned to the linode.
   */
  it('creates a firewall assigned to a linode', () => {
    const region = chooseRegion();

    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: region.id,
      root_pass: randomString(16),
    });

    const firewall = {
      label: randomLabel(),
    };

    cy.defer(createLinode(linodeRequest), 'creating Linode').then((linode) => {
      interceptCreateFirewall().as('createFirewall');
      cy.visitWithLogin('/firewalls/create');

      ui.drawer
        .findByTitle('Create Firewall')
        .should('be.visible')
        .within(() => {
          // Fill out and submit firewall create form.
          containsClick('Label').type(firewall.label);
          cy.findByLabelText('Linodes')
            .should('be.visible')
            .click()
            .type(linode.label);

          ui.autocompletePopper
            .findByTitle(linode.label)
            .should('be.visible')
            .click();

          cy.findByLabelText('Linodes').should('be.visible').click();

          ui.buttonGroup
            .findButtonByTitle('Create Firewall')
            .should('be.visible')
            .should('be.enabled')
            .click();
        });

      cy.wait('@createFirewall');

      // Confirm that firewall is listed on landing page with expected configuration.
      cy.findByText(firewall.label)
        .closest('tr')
        .within(() => {
          cy.findByText(firewall.label).should('be.visible');
          cy.findByText('Enabled').should('be.visible');
          cy.findByText('No rules').should('be.visible');
          cy.findByText(linode.label).should('be.visible');
        });
    });
  });
});
