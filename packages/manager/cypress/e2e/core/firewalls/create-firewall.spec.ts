import { grantsFactory, profileFactory } from '@linode/utilities';
import { createLinodeRequestFactory } from '@linode/utilities';
import { authenticate } from 'support/api/authentication';
import { mockGetUser } from 'support/intercepts/account';
import { interceptCreateFirewall } from 'support/intercepts/firewalls';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { accountUserFactory } from 'src/factories';
authenticate();

describe('create firewall', () => {
  before(() => {
    cleanUp(['lke-clusters', 'linodes', 'firewalls']);
  });
  beforeEach(() => {
    cy.tag('method:e2e');
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
        cy.get('[data-testid="submit"]').click();
        cy.findByText('Label is required.');
        // Fill out and submit firewall create form.
        cy.contains('Label').click();
        cy.focused().type(firewall.label);
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
  // TODO test fails
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

    cy.defer(
      () => createTestLinode(linodeRequest, { securityMethod: 'powered_off' }),
      'creating Linode'
    ).then((linode) => {
      interceptCreateFirewall().as('createFirewall');
      cy.visitWithLogin('/firewalls/create');

      ui.drawer
        .findByTitle('Create Firewall')
        .should('be.visible')
        .within(() => {
          // Fill out and submit firewall create form.
          cy.contains('Label').click();
          cy.focused().type(firewall.label);
          cy.findByLabelText('Linodes').should('be.visible').click();
          cy.focused().type(linode.label);

          ui.autocompletePopper
            .findByTitle(linode.label)
            .should('be.visible')
            .click();

          cy.focused().type('{esc}');

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
          cy.findByText(firewall.label).should('be.visible'); // FAILED
          cy.findByText('Enabled').should('be.visible');
          cy.findByText('No rules').should('be.visible');
          cy.findByText(linode.label).should('be.visible');
        });
    });
  });
});

describe('restricted user cannot create firewall', () => {
  beforeEach(() => {
    cleanUp(['lke-clusters', 'linodes', 'firewalls']);
    const mockProfile = profileFactory.build({
      restricted: true,
      username: randomLabel(),
    });

    const mockUser = accountUserFactory.build({
      restricted: true,
      user_type: 'default',
      username: mockProfile.username,
    });

    const mockGrants = grantsFactory.build({
      global: {
        add_firewalls: false,
      },
    });

    mockGetProfile(mockProfile);
    mockGetProfileGrants(mockGrants);
    mockGetUser(mockUser);
  });

  /*
   * - Verifies that restricted user cannot create firewall on landing page
   */
  it('confirms the create button is disabled on the Firewall Landing page', () => {
    cy.visitWithLogin('/firewalls');
    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.disabled');
  });

  /*
   * - Verifies that restricted user cannot create firewall in drawer
   */
  it('confirms the Create Firewall button is disabled in create drawer', () => {
    cy.visitWithLogin('/firewalls/create');

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText(
          "You don't have permissions to create a new Firewall. Please contact an account administrator for details."
        );
        ui.buttonGroup.findButtonByTitle('Create Firewall').scrollIntoView();
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.disabled');
        // all form inputs are disabled
        cy.get('input').each((input) => {
          cy.wrap(input).should('be.disabled');
        });
      });
  });
});
