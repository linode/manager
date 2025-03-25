import { authenticate } from 'support/api/authentication';
import { entityTag } from 'support/constants/cypress';
import { interceptCreateNodeBalancer } from 'support/intercepts/nodebalancers';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import { createTestLinode } from 'support/util/linodes';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { nodeBalancerFactory } from 'src/factories';

import type { Linode } from '@linode/api-v4';

authenticate();
describe('create NodeBalancer to test the submission of multiple nodes and multiple configs', () => {
  before(() => {
    cleanUp(['tags', 'node-balancers', 'linodes']);
  });

  /*
   * - Confirms NodeBalancer create flow when adding multiple Backend Nodes.
   * - Confirms Summary field displays correct Node number.
   */
  it('creates a NodeBalancer with multiple Backend Nodes', () => {
    const region = chooseRegion();
    const linodePayload = {
      // NodeBalancers require Linodes with private IPs.
      private_ip: true,
      region: region.id,
    };

    const linodePayload_2 = {
      private_ip: true,
      region: region.id,
    };

    const createTestLinodes = async () => {
      return Promise.all([
        createTestLinode(linodePayload),
        createTestLinode(linodePayload_2),
      ]);
    };

    cy.defer(createTestLinodes, 'Creating 2 test Linodes').then(
      ([linode, linode2]: [Linode, Linode]) => {
        const nodeBal = nodeBalancerFactory.build({
          ipv4: linode.ipv4[1],
          label: randomLabel(),
          region: region.id,
        });

        const nodeBal_2 = nodeBalancerFactory.build({
          ipv4: linode2.ipv4[1],
          label: randomLabel(),
          region: region.id,
        });

        interceptCreateNodeBalancer().as('createNodeBalancer');
        cy.visitWithLogin('/nodebalancers/create');
        cy.get('[id="nodebalancer-label"]').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(nodeBal.label);
        cy.findByPlaceholderText(/create a tag/i).click();
        cy.focused().type(entityTag);

        // this will create the NB in newark, where the default Linode was created
        ui.regionSelect.find().click().clear().type(`${region.label}{enter}`);

        // node backend config
        cy.findByText('Label').click();
        cy.focused().type(randomLabel());
        cy.findByLabelText('IP Address').should('be.visible').click();
        cy.focused().type(nodeBal.ipv4);
        ui.autocompletePopper
          .findByTitle(nodeBal.ipv4)
          .should('be.visible')
          .click();
        cy.findByLabelText('Weight').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type('50');

        // Add a backend node
        cy.get('[data-testid="button"]').contains('Add a Node').click();
        cy.findAllByText('Label').last().click();
        cy.focused().type(randomLabel());
        cy.findAllByText('IP Address').last().should('be.visible').click();
        cy.focused().type(nodeBal_2.ipv4);
        ui.autocompletePopper
          .findByTitle(nodeBal_2.ipv4)
          .should('be.visible')
          .click();
        cy.get('[data-testid="textfield-input"]')
          .last()
          .should('be.visible')
          .click();
        cy.focused().clear();
        cy.focused().type('50');

        // Confirm Summary info
        cy.get('[data-qa-summary="true"]').within(() => {
          cy.contains(`Nodes 2`).should('be.visible');
        });

        cy.get('[data-qa-deploy-nodebalancer]').click();
        cy.wait('@createNodeBalancer')
          .its('response.statusCode')
          .should('eq', 200);
      }
    );
  });

  /*
   * - Confirms NodeBalancer create flow when adding additional config.
   * - Confirms Summary field displays correct Config number.
   */
  it('creates a NodeBalancer with an additional config', () => {
    const region = chooseRegion();
    const linodePayload = {
      // NodeBalancers require Linodes with private IPs.
      private_ip: true,
      region: region.id,
    };

    const linodePayload_2 = {
      private_ip: true,
      region: region.id,
    };

    const createTestLinodes = async () => {
      return Promise.all([
        createTestLinode(linodePayload),
        createTestLinode(linodePayload_2),
      ]);
    };

    cy.defer(createTestLinodes, 'Creating 2 test Linodes').then(
      ([linode, linode2]: [Linode, Linode]) => {
        const nodeBal = nodeBalancerFactory.build({
          ipv4: linode.ipv4[1],
          label: randomLabel(),
          region: region.id,
        });

        const nodeBal_2 = nodeBalancerFactory.build({
          ipv4: linode2.ipv4[1],
          label: randomLabel(),
          region: region.id,
        });

        interceptCreateNodeBalancer().as('createNodeBalancer');
        cy.visitWithLogin('/nodebalancers/create');
        cy.get('[id="nodebalancer-label"]').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(nodeBal.label);
        cy.findByPlaceholderText(/create a tag/i).click();
        cy.focused().type(entityTag);

        // This will create the NB in newark, where the default Linode was created
        ui.regionSelect.find().click().clear().type(`${region.label}{enter}`);

        // Node backend config
        cy.findByText('Label').click();
        cy.focused().type(randomLabel());
        cy.findByLabelText('IP Address').should('be.visible').click();
        cy.focused().type(nodeBal.ipv4);
        ui.autocompletePopper
          .findByTitle(nodeBal.ipv4)
          .should('be.visible')
          .click();

        // Add another configuration
        cy.get('[data-testid="button"]')
          .contains('Add another Configuration')
          .click();
        cy.get('[data-qa-panel="Configuration - Port "]').within(() => {
          cy.get('[data-testid="textfield-input"]').first().click();
          cy.focused().type('8080');
        });
        cy.findAllByText('Label').last().click();
        cy.focused().type(randomLabel());
        cy.findAllByText('IP Address').last().should('be.visible').click();
        cy.focused().type(nodeBal_2.ipv4);
        ui.autocompletePopper
          .findByTitle(nodeBal_2.ipv4)
          .should('be.visible')
          .click();

        // Confirm Summary info
        cy.get('[data-qa-summary="true"]').within(() => {
          cy.contains('Configs 2').should('be.visible');
        });

        cy.get('[data-qa-deploy-nodebalancer]').click();
        cy.wait('@createNodeBalancer')
          .its('response.statusCode')
          .should('eq', 200);
      }
    );
  });

  /*
   * - Confirms Port field displays error if same port number used in additional config.
   * - Confirms Label field displays error if label is empty in additional config.
   * - Confirms IP field displays error if ip is empty in additional config.
   */
  it('displays errors during adding new config', () => {
    const region = chooseRegion();
    const linodePayload = {
      // NodeBalancers require Linodes with private IPs.
      private_ip: true,
      region: region.id,
    };

    cy.defer(
      () => createTestLinode(linodePayload),
      'Creating test Linode'
    ).then((linode: Linode) => {
      const nodeBal = nodeBalancerFactory.build({
        ipv4: linode.ipv4[1],
        label: randomLabel(),
        region: region.id,
      });

      cy.visitWithLogin('/nodebalancers/create');
      cy.get('[id="nodebalancer-label"]').should('be.visible').click();
      cy.focused().clear();
      cy.focused().type(nodeBal.label);
      cy.findByPlaceholderText(/create a tag/i).click();
      cy.focused().type(entityTag);

      // This will create the NB in newark, where the default Linode was created
      ui.regionSelect.find().click().clear().type(`${region.label}{enter}`);

      // Node backend config
      cy.findByText('Label').click();
      cy.focused().type(randomLabel());
      cy.findByLabelText('IP Address').should('be.visible').click();
      cy.focused().type(nodeBal.ipv4);
      ui.autocompletePopper
        .findByTitle(nodeBal.ipv4)
        .should('be.visible')
        .click();

      // Add another configuration
      cy.get('[data-testid="button"]')
        .contains('Add another Configuration')
        .click();
      cy.get('[data-qa-panel="Configuration - Port "]').within(() => {
        cy.get('[data-testid="textfield-input"]').first().click();
        cy.focused().type('80');
      });
      cy.get('[data-qa-deploy-nodebalancer]').click();

      // Confirm error displays
      cy.contains('Port must be unique').as('qaPort').scrollIntoView();
      cy.get('@qaPort').should('be.visible');
      cy.contains('Label is required').as('qaLabelIs').scrollIntoView();
      cy.get('@qaLabelIs').should('be.visible');
      cy.contains('Must be a valid private IPv4 address.')
        .as('qaMustbe')
        .scrollIntoView();
      cy.get('@qaMustbe').should('be.visible');
    });
  });
});
