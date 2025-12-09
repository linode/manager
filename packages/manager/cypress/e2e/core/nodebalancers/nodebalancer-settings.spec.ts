import { nodeBalancerFactory } from '@linode/utilities';
import {
  mockAddFirewallDevice,
  mockGetFirewalls,
} from 'support/intercepts/firewalls';
import {
  mockGetNodeBalancer,
  mockGetNodeBalancerFirewalls,
} from 'support/intercepts/nodebalancers';
import { ui } from 'support/ui';

import { firewallDeviceFactory, firewallFactory } from 'src/factories';

describe('Firewalls', () => {
  it('allows the user to assign a Firewall from the NodeBalancer settings page', () => {
    const nodebalancer = nodeBalancerFactory.build();
    const firewalls = firewallFactory.buildList(3);
    const firewallToAttach = firewalls[1];
    const firewallDevice = firewallDeviceFactory.build({
      entity: { id: nodebalancer.id, type: 'nodebalancer' },
    });

    mockGetNodeBalancer(nodebalancer).as('getNodeBalancer');
    mockGetNodeBalancerFirewalls(nodebalancer.id, []).as(
      'getNodeBalancerFirewalls'
    );
    mockGetFirewalls(firewalls).as('getFirewalls');
    mockAddFirewallDevice(firewallToAttach.id, firewallDevice).as(
      'addFirewallDevice'
    );

    cy.visitWithLogin(`/nodebalancers/${nodebalancer.id}/settings`);

    cy.wait(['@getNodeBalancer', '@getNodeBalancerFirewalls']);

    cy.findByText('No Firewalls are assigned.').should('be.visible');

    ui.button
      .findByTitle('Add Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    // Firewalls should fetch when the drawer's contents are mounted
    cy.wait('@getFirewalls');

    mockGetNodeBalancerFirewalls(nodebalancer.id, [firewallToAttach]).as(
      'getNodeBalancerFirewalls'
    );

    ui.drawer.findByTitle('Add Firewall').within(() => {
      cy.findByLabelText('Firewall').should('be.visible').click();

      // Verify all firewalls show in the Select
      for (const firewall of firewalls) {
        ui.autocompletePopper
          .findByTitle(firewall.label)
          .should('be.visible')
          .should('be.enabled');
      }

      ui.autocompletePopper.findByTitle(firewallToAttach.label).click();

      ui.buttonGroup.find().within(() => {
        ui.button
          .findByTitle('Add Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    });

    // Verify the request has the correct payload
    cy.wait('@addFirewallDevice').then((xhr) => {
      const requestPayload = xhr.request.body;
      expect(requestPayload.id).to.equal(nodebalancer.id);
      expect(requestPayload.type).to.equal('nodebalancer');
    });

    ui.toast.assertMessage('Successfully assigned Firewall');

    // The NodeBalancer's firewalls list should be invalidated after the new firewall device was added
    cy.wait('@getNodeBalancerFirewalls');

    // Verify the firewall shows up in the table
    cy.findByText(firewallToAttach.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Unassign').should('be.visible').should('be.enabled');
      });

    // The "Add Firewall" button should now be disabled beause the NodeBalancer has a firewall attached
    ui.button
      .findByTitle('Add Firewall')
      .should('be.visible')
      .should('be.disabled');
  });
});
