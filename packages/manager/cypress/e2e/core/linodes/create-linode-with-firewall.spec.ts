import { linodeFactory, regionFactory } from '@linode/utilities';
import {
  mockGetAccount,
  mockGetAccountSettings,
} from 'support/intercepts/account';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetFirewallSettings } from 'support/intercepts/firewalls';
import {
  mockCreateFirewall,
  mockCreateFirewallError,
  mockGetFirewalls,
  mockGetFirewallTemplate,
} from 'support/intercepts/firewalls';
import { mockApiInternalUser } from 'support/intercepts/general';
import {
  mockCreateLinode,
  mockGetLinodeDetails,
} from 'support/intercepts/linodes';
import { mockGetRegion, mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { linodeCreatePage } from 'support/ui/pages';
import { assertNewLinodeInterfacesIsAvailable } from 'support/util/linodes';
import { randomLabel, randomNumber, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import {
  accountFactory,
  accountSettingsFactory,
  firewallFactory,
  firewallTemplateFactory,
} from 'src/factories';

import type { Region } from '@linode/api-v4';

describe('Create Linode with Firewall (Legacy)', () => {
  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: false },
    });
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
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    // Confirm that mocked Firewall is shown in the Autocomplete, and then select it.
    cy.findByText('Assign Firewall').click();
    cy.focused().type(`${mockFirewall.label}`);

    ui.autocompletePopper
      .findByTitle(mockFirewall.label)
      .should('be.visible')
      .click();

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
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
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    cy.findByText('Create Firewall').should('be.visible').click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        // An error message appears when attempting to create a Firewall without a label
        cy.get('[data-testid="submit"]').click();
        cy.findByText('Label is required.');
        // Fill out and submit firewall create form.
        cy.contains('Label').click();
        cy.focused().type(mockFirewall.label);
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
    cy.findByText('Assign Firewall').click();
    cy.focused().type(`${mockFirewall.label}`);

    ui.autocompletePopper
      .findByTitle(mockFirewall.label)
      .should('be.visible')
      .click();

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
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
   * - Mocks the internal header to enable the Generate Compliant Firewall banner.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can generate and assign a compliant Firewall during Linode Create flow', () => {
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

    const mockTemplate = firewallTemplateFactory.build({
      slug: 'akamai-non-prod',
    });

    mockApiInternalUser();
    mockCreateFirewall(mockFirewall).as('createFirewall');
    mockGetFirewalls([mockFirewall]).as('getFirewall');
    mockGetFirewallTemplate(mockTemplate).as('getTemplate');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    // Creating the linode without a firewall should display a warning.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.disabled');

    cy.findByLabelText(
      'I am authorized to create a Linode without a Cloud Firewall'
    ).click();

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled');

    cy.findByText('Generate Compliant Firewall').should('be.visible').click();

    ui.dialog
      .findByTitle('Generate an Akamai Compliant Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('Generate Firewall Now')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Generating Firewall');
        cy.findByText('Complete!');
        cy.findByText('OK').should('be.visible').should('be.enabled').click();
      });
    cy.wait('@createFirewall');

    cy.findByText(mockFirewall.label).should('be.visible');

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
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
   * - Mocks the internal header to enable the Generate Compliant Firewall banner.
   * - Mocks an error response to the Create Firewall call.
   */
  it('displays errors encountered while trying to generate a compliant firewall', () => {
    const mockFirewall = firewallFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockTemplate = firewallTemplateFactory.build({
      slug: 'akamai-non-prod',
    });

    const mockError = 'Mock error';

    mockApiInternalUser();
    mockGetFirewalls([mockFirewall]).as('getFirewall');
    mockGetFirewallTemplate(mockTemplate).as('getTemplate');
    mockCreateFirewallError(mockError).as('createFirewall');

    cy.visitWithLogin('/linodes/create');

    // Confirm the Linode Interfaces section is not present.
    assertNewLinodeInterfacesIsAvailable(false);

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled');

    cy.findByText('Generate Compliant Firewall').should('be.visible').click();

    ui.dialog
      .findByTitle('Generate an Akamai Compliant Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('Generate Firewall Now')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Generating Firewall');
        cy.findByText(mockError);
        cy.findByText('Retry').should('be.visible').should('be.enabled');
        cy.findByText('Close').should('be.visible').should('be.enabled');
      });
    cy.wait('@createFirewall');
  });
});

describe('Create Linode with Firewall (Linode Interfaces)', () => {
  const linodeRegion: Region = regionFactory.build({
    id: 'us-east',
    label: 'Newark, NJ',
    capabilities: ['Cloud Firewall', 'Linodes', 'Linode Interfaces'],
  });

  beforeEach(() => {
    mockAppendFeatureFlags({
      linodeInterfaces: { enabled: true },
    });
    mockGetAccount(
      accountFactory.build({
        email: 'sdet@akamai.com',
        capabilities: ['Cloud Firewall', 'Linodes', 'Linode Interfaces'],
      })
    );
    mockGetAccountSettings(
      accountSettingsFactory.build({
        interfaces_for_new_linodes: 'legacy_config_default_but_linode_allowed',
      })
    );
    mockGetFirewallSettings({
      default_firewall_ids: {
        linode: null,
        public_interface: null,
        vpc_interface: null,
        nodebalancer: null,
      },
    });
    mockGetRegions([linodeRegion]);
    mockGetRegion(linodeRegion);
  });

  /*
   * Legacy Configuration Profile Interfaces
   * - Confirms UI flow to create a Linode with an existing Firewall using mock API data.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can assign existing Firewall during Linode Create flow (legacy)', () => {
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
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Confirm that mocked Firewall is shown in the Autocomplete, and then select it.
    cy.findByLabelText('Firewall').should('be.visible');
    cy.get('[data-qa-autocomplete="Firewall"]').within(() => {
      cy.get('[data-testid="textfield-input"]').click();
      cy.focused().type(`${mockFirewall.label}`);
    });

    ui.autocompletePopper
      .findByTitle(mockFirewall.label)
      .should('be.visible')
      .click();

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
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
   * Linode Interfaces
   * - Confirms UI flow to create a Linode with an existing Firewall using mock API data.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can assign existing Firewall during Linode Create flow (Linode Interfaces)', () => {
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
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Switch to Linode Interfaces
    linodeCreatePage.selectLinodeInterfacesType();

    // Confirm that mocked Firewall is shown in the Autocomplete, and then select it.
    cy.findByLabelText('Public Interface Firewall').should('be.visible');
    cy.get('[data-qa-autocomplete="Public Interface Firewall"]').within(() => {
      cy.get('[data-testid="textfield-input"]').click();
      cy.focused().type(`${mockFirewall.label}`);
    });

    ui.autocompletePopper
      .findByTitle(mockFirewall.label)
      .should('be.visible')
      .click();

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      // TODO: M3-9955 Missing info in Summary section
      // cy.findByText('Firewall Assigned').should('be.visible');
    });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const firewallId = requestPayload['interfaces'][0]['firewall_id'];
      expect(firewallId).to.equal(mockFirewall.id);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * Legacy Configuration Profile Interfaces
   * - Uses mock API data to confirm Firewall creation and attachment UI flow during Linode create.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can assign new Firewall during Linode Create flow (legacy)', () => {
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
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    cy.findByText('Create Firewall').should('be.visible').click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        // An error message appears when attempting to create a Firewall without a label
        cy.get('[data-testid="submit"]').click();
        cy.findByText('Label is required.');
        // Fill out and submit firewall create form.
        cy.contains('Label').click();
        cy.focused().type(mockFirewall.label);
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
    cy.findByLabelText('Firewall').should('be.visible');
    cy.get('[data-qa-autocomplete="Firewall"]').within(() => {
      cy.get('[data-testid="textfield-input"]').click();
      cy.focused().type(`${mockFirewall.label}`);
    });

    ui.autocompletePopper
      .findByTitle(mockFirewall.label)
      .should('be.visible')
      .click();

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
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
   * Linode Interfaces
   * - Uses mock API data to confirm Firewall creation and attachment UI flow during Linode create.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can assign new Firewall during Linode Create flow (Linode Interfaces)', () => {
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
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Switch to Linode Interfaces
    linodeCreatePage.selectLinodeInterfacesType();

    cy.findByText('Create Firewall').should('be.visible').click();

    ui.drawer
      .findByTitle('Create Firewall')
      .should('be.visible')
      .within(() => {
        // An error message appears when attempting to create a Firewall without a label
        cy.get('[data-testid="submit"]').click();
        cy.findByText('Label is required.');
        // Fill out and submit firewall create form.
        cy.contains('Label').click();
        cy.focused().type(mockFirewall.label);
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
    cy.findByLabelText('Public Interface Firewall').should('be.visible');
    cy.get('[data-qa-autocomplete="Public Interface Firewall"]').within(() => {
      cy.get('[data-testid="textfield-input"]').click();
      cy.focused().type(`${mockFirewall.label}`);
    });

    ui.autocompletePopper
      .findByTitle(mockFirewall.label)
      .should('be.visible')
      .click();

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      // TODO: M3-9955 Missing info in Summary section
      // cy.findByText('Firewall Assigned').should('be.visible');
    });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const firewallId = requestPayload['interfaces'][0]['firewall_id'];
      expect(firewallId).to.equal(mockFirewall.id);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * Legacy Configuration Profile Interfaces
   * - Mocks the internal header to enable the Generate Compliant Firewall banner.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can generate and assign a compliant Firewall during Linode Create flow (legacy)', () => {
    const mockFirewall = firewallFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    const mockTemplate = firewallTemplateFactory.build({
      slug: 'akamai-non-prod',
    });

    mockApiInternalUser();
    mockCreateFirewall(mockFirewall).as('createFirewall');
    mockGetFirewalls([mockFirewall]).as('getFirewall');
    mockGetFirewallTemplate(mockTemplate).as('getTemplate');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Creating the linode without a firewall should display a warning.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.disabled');

    cy.findByLabelText(
      'I am authorized to create a Linode without a Cloud Firewall'
    ).click();

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled');

    cy.findByText('Generate Compliant Firewall').should('be.visible').click();

    ui.dialog
      .findByTitle('Generate an Akamai Compliant Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('Generate Firewall Now')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Complete!');
        cy.findByText('OK').should('be.visible').should('be.enabled').click();
      });
    cy.wait('@createFirewall');

    cy.findByText(mockFirewall.label).should('be.visible');

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
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
   * Linode Interfaces
   * - Mocks the internal header to enable the Generate Compliant Firewall banner.
   * - Confirms that Firewall is reflected in create summary section.
   * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
   */
  it('can generate and assign a compliant Firewall during Linode Create flow (Linode Interfaces)', () => {
    const mockFirewall = firewallFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockLinode = linodeFactory.build({
      id: randomNumber(),
      label: randomLabel(),
      region: linodeRegion.id,
    });

    const mockTemplate = firewallTemplateFactory.build({
      slug: 'akamai-non-prod',
    });

    mockApiInternalUser();
    mockCreateFirewall(mockFirewall).as('createFirewall');
    mockGetFirewalls([mockFirewall]).as('getFirewall');
    mockGetFirewallTemplate(mockTemplate).as('getTemplate');
    mockCreateLinode(mockLinode).as('createLinode');
    mockGetLinodeDetails(mockLinode.id, mockLinode);

    cy.visitWithLogin('/linodes/create');

    linodeCreatePage.setLabel(mockLinode.label);
    linodeCreatePage.selectImage('Debian 12');
    linodeCreatePage.selectRegionById(linodeRegion.id);
    linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
    linodeCreatePage.setRootPassword(randomString(32));

    // Confirm the Linode Interfaces section is shown.
    assertNewLinodeInterfacesIsAvailable();

    // Switch to Linode Interfaces
    linodeCreatePage.selectLinodeInterfacesType();

    // Creating the linode without a firewall should display a warning.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.disabled');

    cy.findByLabelText(
      'I am authorized to create a Linode without a Cloud Firewall'
    ).click();

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled');

    cy.findByText('Generate Compliant Firewall').should('be.visible').click();

    ui.dialog
      .findByTitle('Generate an Akamai Compliant Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('Generate Firewall Now')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText('Complete!');
        cy.findByText('OK').should('be.visible').should('be.enabled').click();
      });
    cy.wait('@createFirewall');

    cy.findByText(mockFirewall.label).should('be.visible');

    // Confirm Firewall assignment indicator is shown in Linode summary.
    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
    cy.get('[data-qa-linode-create-summary]').within(() => {
      // TODO: M3-9955 Missing info in Summary section
      // cy.findByText('Firewall Assigned').should('be.visible');
    });

    // Create Linode and confirm contents of outgoing API request payload.
    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled')
      .click();

    cy.wait('@createLinode').then((xhr) => {
      const requestPayload = xhr.request.body;
      const firewallId = requestPayload['interfaces'][0]['firewall_id'];
      expect(firewallId).to.equal(mockFirewall.id);
    });

    // Confirm redirect to new Linode.
    cy.url().should('endWith', `/linodes/${mockLinode.id}`);
    // Confirm toast notification should appear on Linode create.
    ui.toast.assertMessage(`Your Linode ${mockLinode.label} is being created.`);
  });

  /*
   * - Mocks the internal header to enable the Generate Compliant Firewall banner.
   * - Mocks an error response to the Create Firewall call.
   */
  it('displays errors encountered while trying to generate a compliant firewall', () => {
    const mockFirewall = firewallFactory.build({
      id: randomNumber(),
      label: randomLabel(),
    });

    const mockTemplate = firewallTemplateFactory.build({
      slug: 'akamai-non-prod',
    });

    const mockError = 'Mock error';

    mockApiInternalUser();
    mockGetFirewalls([mockFirewall]).as('getFirewall');
    mockGetFirewallTemplate(mockTemplate).as('getTemplate');
    mockCreateFirewallError(mockError).as('createFirewall');

    cy.visitWithLogin('/linodes/create');

    ui.button
      .findByTitle('Create Linode')
      .should('be.visible')
      .should('be.enabled');

    cy.findByText('Generate Compliant Firewall').should('be.visible').click();

    ui.dialog
      .findByTitle('Generate an Akamai Compliant Firewall')
      .should('be.visible')
      .within(() => {
        cy.findByText('Generate Firewall Now')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.findByText(mockError);
        cy.findByText('Retry').should('be.visible').should('be.enabled');
        cy.findByText('Close').should('be.visible').should('be.enabled');
      });
    cy.wait('@createFirewall');
  });
});
