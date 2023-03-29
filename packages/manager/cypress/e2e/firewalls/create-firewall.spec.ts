import { createLinode } from '@linode/api-v4/lib/linodes';
import { createLinodeRequestFactory } from 'src/factories/linodes';
import { regions } from 'support/constants/regions';
import { authenticate } from 'support/api/authentication';
import { containsClick, getClick } from 'support/helpers';
import { interceptCreateFirewall } from 'support/intercepts/firewalls';
import { randomItem, randomString, randomLabel } from 'support/util/random';

authenticate();
describe('create firewall', () => {
  /*
   * - Creates a firewall that is not assigned to a Linode.
   * - Confirms that an error message appears upon submitting without a label.
   * - Confirms that firewall is listed correctly on firewalls landing page.
   * - Confirms that tags exist on firewall.
   */
  it('creates a firewall without a linode', () => {
    const firewall = {
      label: randomLabel(),
    };

    interceptCreateFirewall().as('createFirewall');
    cy.visitWithLogin('/firewalls/create');

    // An error message appears when attempting to create a Firewall without a label
    getClick('[data-testid="create-firewall-submit"]');
    cy.findByText('Label is required.');

    // Fill out and submit firewall create form.
    containsClick('Label').type(firewall.label);
    getClick('[data-testid="create-firewall-submit"]');

    // Confirm that firewall is listed on landing page with expected configuration.
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
    const regionId = randomItem(regions);

    const linodeRequest = createLinodeRequestFactory.build({
      label: randomLabel(),
      region: regionId,
      root_pass: randomString(16),
    });

    const firewall = {
      label: randomLabel(),
    };

    cy.defer(createLinode(linodeRequest)).then((linode) => {
      interceptCreateFirewall().as('createFirewall');
      cy.visitWithLogin('/firewalls/create');

      // Fill out and submit firewall create form.
      containsClick('Label').type(firewall.label);
      containsClick('Select a Linode').type(`${linode.label}{enter}`);

      getClick('[data-testid="create-firewall-submit"]');

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
