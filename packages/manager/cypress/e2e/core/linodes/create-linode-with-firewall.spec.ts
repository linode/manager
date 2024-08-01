import { linodeFactory, firewallFactory } from 'src/factories';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import {
  mockCreateLinode,
  mockGetLinodeDetails,
} from 'support/intercepts/linodes';
import {
  mockGetFirewalls,
  mockCreateFirewall,
} from 'support/intercepts/firewalls';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

describe('Create Linode with Firewall', () => {
  // TODO Remove feature flag mocks when `linodeCreateRefactor` flag is retired.
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeCreateRefactor: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
  });

  /*
   * - Confirms UI flow to create a Linode with an existing Firewall using mock API data.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can assign existing Firewall during Linode Create flow', () => {
    const linodeRegion = chooseRegion({ capabilities: ['Cloud Firewall'] });

    const mockFirewall = firewallFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    mockGetFirewalls([mockFirewall]).as('getFirewall');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm that mocked Firewall is shown in the Autocomplete, and then select it.
    cy.findByText('Assign Firewall').click().type(`${mockFirewall.label}`);

    ui.autocompletePopper
      .findByTitle(mockFirewall.label)
      .should('be.visible')
      .click();

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]')
      .scrollIntoView()
      .within(() => {
        cy.findByText('Firewall Assigned').should('be.visible');
      });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const firewallId = requestPayload['firewall_id'];
      expect(firewallId).to.equal(mockFirewall.id);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * - Uses mock API data to confirm Firewall creation and attachment UI flow during Linode create.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can assign new Firewall during Linode Create flow', () => {
    const linodeRegion = chooseRegion({ capabilities: ['Cloud Firewall'] });

    const mockFirewall = firewallFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    mockCreateFirewall(mockFirewall).as('createFirewall');
    mockGetFirewalls([mockFirewall]).as('getFirewall');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 11');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    cy.findByText('Create Firewall').should('be.visible').click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        // An error message appears when attempting to create a Firewall without a label
        cy.get('[data-testid="submit"]').click();
        cy.findByText('Label is required.');
        // Fill out and submit firewall create form.
        cy.contains('Label').click().type(mockFirewall.label);
        ui.buttonGroup
          .findButtonByTitle('Create Firewall')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });
    cy.wait('@getFirewall');
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(
      `Firewall ${mockFirewall.label} successfully created`
    );

    // Confirm that mocked Firewall is shown in the Autocomplete, and then select it.
    cy.findByText('Assign Firewall').click().type(`${mockFirewall.label}`);

    ui.autocompletePopper
      .findByTitle(mockFirewall.label)
      .should('be.visible')
      .click();

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]')
      .scrollIntoView()
      .within(() => {
        cy.findByText('Firewall Assigned').should('be.visible');
      });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const firewallId = requestPayload['firewall_id'];
      expect(firewallId).to.equal(mockFirewall.id);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });
});
