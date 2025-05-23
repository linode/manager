/**
 * @file Integration tests for Firewall creation flows involving templates.
 */

import { mockGetAccount } from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockCreateFirewall,
  mockGetFirewalls,
  mockGetFirewallTemplate,
  mockGetFirewallTemplates,
} from 'support/intercepts/firewalls';
import { mockApiInternalUser } from 'support/intercepts/general';
import { ui } from 'support/ui';
import { randomLabel } from 'support/util/random';

import {
  accountFactory,
  firewallFactory,
  firewallTemplateFactory,
} from 'src/factories';

const mockFirewallTemplateVpc = firewallTemplateFactory.build({
  slug: 'vpc',
});

const mockFirewallTemplatePublic = firewallTemplateFactory.build({
  slug: 'public',
});

const mockFirewallTemplateInternalUser = firewallTemplateFactory.build({
  slug: 'akamai-non-prod',
});

describe('Can create Firewalls using templates', () => {
  beforeEach(() => {
    // TODO M3-9775 - Remove mock once `linodeInterfaces` feature flag is removed.
    mockAppendFeatureFlags({
      linodeInterfaces: {
        enabled: true,
      },
    });
    // TODO Remove mock once all accounts get 'Linode Interfaces' capability.
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Cloud Firewall', 'Linode Interfaces', 'Linodes'],
      })
    );
  });

  /*
   * - Confirms that users can create a Firewall using the VPC template.
   * - Confirms that VPC template-specific details are shown prior to creating Firewall.
   * - Confirms that outgoing Firewall create request includes chosen Firewall label.
   * - Confirms that outgoing Firewall create request includes chosen rules.
   * - Confirms that landing page automatically updates to display the new Firewall.
   */
  it('can create a Firewall using VPC template', () => {
    const mockFirewall = firewallFactory.build({
      label: randomLabel(),
      rules: mockFirewallTemplateVpc.rules,
      entities: [],
    });

    mockGetFirewalls([]);
    mockGetFirewallTemplates([
      mockFirewallTemplateVpc,
      mockFirewallTemplatePublic,
    ]);
    mockGetFirewallTemplate(mockFirewallTemplateVpc);
    mockCreateFirewall(mockFirewall).as('createFirewall');

    cy.visitWithLogin('/firewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('From a Template').should('be.visible').click();
        cy.findByText('Label').should('be.visible').type(mockFirewall.label);

        cy.findByLabelText('Firewall Template').click();
        ui.autocompletePopper.find().within(() => {
          cy.findByText('VPC Firewall Template').should('be.visible').click();
        });

        // Confirm that selecting "VPC Firewall Template" shows descriptive
        // information and rule details specific for VPC selection.
        cy.contains('traffic from the VPC address space').should('be.visible');
        cy.contains('Allow traffic for RFC1918 ranges').should('be.visible');

        // Create the Firewall.
        mockGetFirewalls([mockFirewall]);
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .scrollIntoView()
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@createFirewall').then((xhr) => {
      // Confirm that rules reflect the selected template.
      expect(xhr.request.body['label']).to.equal(mockFirewall.label);
      expect(xhr.request.body['rules']).to.deep.equal(
        mockFirewallTemplateVpc.rules
      );
    });

    // Confirm that page automatically updates to show the new Firewall,
    // and that the expected information is displayed alongside the Firewall.
    cy.findByText(mockFirewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('1 Inbound / 1 Outbound').should('be.visible');
        cy.findByText('None assigned').should('be.visible');
      });
  });

  /*
   * - Confirms that users can create a Firewall using the Public template.
   * - Confirms that Public template-specific details are shown prior to creating Firewall.
   * - Confirms that outgoing Firewall create request includes chosen Firewall label
   * - Confirms that outgoing Firewall create request includes chosen rules.
   * - Confirms that landing page automatically updates to display the new Firewall.
   */
  it('can create a Firewall using Public template', () => {
    const mockFirewall = firewallFactory.build({
      label: randomLabel(),
      rules: mockFirewallTemplatePublic.rules,
      entities: [],
    });

    mockGetFirewalls([]).as('getFirewalls');
    mockGetFirewallTemplates([
      mockFirewallTemplateVpc,
      mockFirewallTemplatePublic,
    ]);
    mockGetFirewallTemplate(mockFirewallTemplatePublic);
    mockCreateFirewall(mockFirewall).as('createFirewall');

    cy.visitWithLogin('/firewalls');
    cy.wait('@getFirewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('From a Template').should('be.visible').click();
        cy.findByText('Label').should('be.visible').type(mockFirewall.label);

        cy.findByLabelText('Firewall Template').click();
        ui.autocompletePopper.find().within(() => {
          cy.findByText('Public Firewall Template')
            .should('be.visible')
            .click();
        });

        // Confirm that selecting "Public Firewall Template" shows descriptive
        // information and rule details specific to the public Firewall template.
        cy.contains(
          'This rule set is a starting point for Public Linode Interfaces. It allows SSH access and essential networking control traffic.'
        ).should('be.visible');

        // Create the Firewall
        mockGetFirewalls([mockFirewall]).as('getFirewalls');
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@createFirewall').then((xhr) => {
      // Confirm that label reflects chosen label
      // and that the Firewall rules reflect the selected template.
      expect(xhr.request.body['label']).to.equal(mockFirewall.label);
      expect(xhr.request.body['rules']).to.deep.equal(
        mockFirewallTemplatePublic.rules
      );
    });

    // Confirm that page automatically updates to show the new Firewall,
    // and that the expected information is displayed alongside the Firewall.
    cy.findByText(mockFirewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('1 Inbound / 1 Outbound').should('be.visible');
        cy.findByText('None assigned').should('be.visible');
      });
  });

  /*
   * - Confirms that users can create a Firewall using the internal template.
   * - Confirms that internal choice is present when internal API header exists and API includes the template.
   * - Confirms that outgoing Firewall create request includes selected Firewall label.
   * - Confirms that outgoing Firewall create request includes chosen rules.
   * - Confirms that landing page automatically updates to display the new Firewall.
   */
  it('can create a Firewall using internal-only template as internal user', () => {
    const mockFirewall = firewallFactory.build({
      label: randomLabel(),
      rules: mockFirewallTemplateInternalUser.rules,
      entities: [],
    });

    mockGetFirewalls([]);
    mockGetFirewallTemplates([
      mockFirewallTemplateInternalUser,
      mockFirewallTemplateVpc,
      mockFirewallTemplatePublic,
    ]);
    mockGetFirewallTemplate(mockFirewallTemplateInternalUser);
    mockCreateFirewall(mockFirewall).as('createFirewall');
    mockApiInternalUser();

    cy.visitWithLogin('/firewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('From a Template').should('be.visible').click();
        cy.findByText('Label').should('be.visible').type(mockFirewall.label);

        cy.findByLabelText('Firewall Template').click();
        ui.autocompletePopper.find().within(() => {
          cy.findByText('Akamai Internal Firewall Template')
            .should('be.visible')
            .click();
        });

        // No descriptive text appears when selecting internal template.
        // Proceed with Firewall creation.
        mockGetFirewalls([mockFirewall]);
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.wait('@createFirewall').then((xhr) => {
      // Confirm that page automatically updates to show the new Firewall,
      // and that the expected information is displayed alongside the Firewall.
      expect(xhr.request.body['label']).to.equal(mockFirewall.label);
      expect(xhr.request.body['rules']).to.deep.equal(
        mockFirewallTemplateInternalUser.rules
      );
    });

    // Confirm that page automatically updates to show the new Firewall,
    // and that the expected information is displayed alongside the Firewall.
    cy.findByText(mockFirewall.label)
      .should('be.visible')
      .closest('tr')
      .within(() => {
        cy.findByText('Enabled').should('be.visible');
        cy.findByText('1 Inbound / 1 Outbound').should('be.visible');
        cy.findByText('None assigned').should('be.visible');
      });
  });

  /*
   * - Confirms that the "Akamai Internal Firewall Template" Firewall template is absent for normal users.
   * - Confirms absence when internal user API header is not present and `/firewalls/templates` API response omits template.
   */
  it('cannot create a Firewall using internal-only template as normal user', () => {
    mockGetFirewalls([]).as('getFirewalls');
    mockGetFirewallTemplates([
      mockFirewallTemplateVpc,
      mockFirewallTemplatePublic,
    ]);

    cy.visitWithLogin('/firewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('From a Template').should('be.visible').click();
        cy.findByText('Label').should('be.visible').type(randomLabel());

        cy.findByLabelText('Firewall Template').click();
        ui.autocompletePopper.find().within(() => {
          cy.findByText('VPC Firewall Template').should('be.visible');
          cy.findByText('Public Firewall Template').should('be.visible');
          cy.findByText('Akamai Internal Firewall Template').should(
            'not.exist'
          );
        });
      });
  });

  /*
   * - Confirms a validation error displays for firewall label if no label inputted
   * - Confirms a validation error displays for template select if no template chosen
   */
  it('displays an error when trying to create a Firewall from a template without a label', () => {
    mockGetFirewalls([]).as('getFirewalls');
    mockGetFirewallTemplates([
      mockFirewallTemplateVpc,
      mockFirewallTemplatePublic,
    ]);
    mockGetFirewallTemplate(mockFirewallTemplatePublic);

    cy.visitWithLogin('/firewalls');
    cy.wait('@getFirewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('From a Template').should('be.visible').click();

        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.findByText('Label is required.');
    cy.findByText('Please select a template to create a firewall from.');
  });

  // TODO M3-9775 - Delete this test once `linodeInterfaces` feature flag is removed.
  /*
   * - Confirms that "Custom Firewall" and "From a Template" selections are absent when feature flag is disabled.
   */
  it('does not show template selection when Linode Interfaces is disabled', () => {
    mockAppendFeatureFlags({
      linodeInterfaces: {
        enabled: false,
      },
    });
    mockGetFirewalls([]);

    cy.visitWithLogin('/firewalls');

    ui.button
      .findByTitle('Create Firewall')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        // Assert visibility of create button before confirming absence of
        // template/custom radio buttons to eliminate the risk of false positives
        // from the assertions succeeding before the drawer contents loads, etc.
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible');

        cy.findByText('From a Template').should('not.exist');
        cy.findByText('Custom Firewall').should('not.exist');
      });
  });
});
