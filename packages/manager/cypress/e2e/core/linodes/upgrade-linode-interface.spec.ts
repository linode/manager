import {
  configFactory,
  linodeFactory,
  linodeInterfaceFactoryPublic,
  upgradeLinodeInterfaceFactory,
} from '@linode/utilities';
import { accountFactory } from '@src/factories';
import { authenticate } from 'support/api/authentication';
import {
  configSelectSharedText,
  dryRunButtonText,
  errorDryRunText,
  upgradeInterfacesButtonText,
  upgradeInterfacesWarningText,
} from 'support/constants/linode-interfaces';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockGetLinodeConfig,
  mockGetLinodeConfigs,
} from 'support/intercepts/configs';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import {
  mockGetLinodeDetails,
  mockUpgradeNewLinodeInterface,
  mockUpgradeNewLinodeInterfaceError,
} from 'support/intercepts/linodes';
import { ui } from 'support/ui';
import { cleanUp } from 'support/util/cleanup';
import {
  assertPromptDialogContent,
  assertUpgradeSummay,
} from 'support/util/linodes';
import { randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

authenticate();
describe('upgrade to new Linode Interface flow', () => {
  beforeEach(() => {
    cleanUp(['linodes']);
    cy.tag('method:e2e');

    // TODO M3-9775: Remove mock when `linodeInterfaces` feature flag is removed.
    mockAppendFeatureFlags({
      linodeInterfaces: {
        enabled: true,
      },
    });

    // TODO Remove account mock when 'Linode Interfaces' capability is generally available.
    mockGetAccount(
      accountFactory.build({
        capabilities: ['Linodes', 'Linode Interfaces'],
      })
    );
  });

  /*
   * - Confirms that config dialog interfaces section is absent on Linodes that use new interfaces.
   * - Confirms absence on edit and add config dialog.
   */
  it('does not show interfaces section when upgrading to Linodes with new interfaces', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(1000, 99999),
      label: randomLabel(),
      region: chooseRegion().id,
      interface_generation: 'linode',
    });

    const mockConfig = configFactory.build({
      label: randomLabel(),
      id: randomNumber(1000, 99999),
      interfaces: null,
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode);
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]);
    mockGetLinodeConfig(mockLinode.id, mockConfig);

    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
      'be.visible'
    );

    // "UPGRADE" button is absence
    cy.findByText('Linode').should('be.visible');
    cy.findByText('Configuration Profile').should('not.exist');
    cy.findByText('UPGRADE').should('not.exist');

    cy.get('[data-testid="Configurations"]').should('be.visible').click();

    cy.findByLabelText('List of Configurations')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Edit')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm absence of the interfaces section when editing an existing config.
    ui.dialog
      .findByTitle('Edit Configuration')
      .should('be.visible')
      .within(() => {
        // Scroll "Networking" section into view, and confirm that Interfaces
        // options are absent and informational text is shown instead.
        cy.findByText('Networking').scrollIntoView();
        cy.contains(
          "Go to Network to view your Linode's Network interfaces."
        ).should('be.visible');
        cy.findByText('Primary Interface (Default Route)').should('not.exist');
        cy.findByText('eth0').should('not.exist');
        cy.findByText('eth1').should('not.exist');
        cy.findByText('eth2').should('not.exist');

        ui.button.findByTitle('Cancel').click();
      });

    // Confirm asbence of the interfaces section when adding a new config.
    ui.button
      .findByTitle('Add Configuration')
      .should('be.visible')
      .should('be.enabled')
      .click();

    ui.dialog
      .findByTitle('Add Configuration')
      .should('be.visible')
      .within(() => {
        // Scroll "Networking" section into view, and confirm that Interfaces
        // options are absent and informational text is shown instead.
        cy.findByText('Networking').scrollIntoView();
        cy.contains(
          "Go to Network to view your Linode's Network interfaces."
        ).should('be.visible');
        cy.findByText('Primary Interface (Default Route)').should('not.exist');
        cy.findByText('eth0').should('not.exist');
        cy.findByText('eth1').should('not.exist');
        cy.findByText('eth2').should('not.exist');
      });
  });

  /*
   * - Confirm button appears in Details footer for linodes with legacy interfaces.
   * - Confirm clicking 'UPGRADE' button flow.
   */
  it('upgrades from a single legacy configuration to new Linode interfaces (Public) from details page', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(1000, 99999),
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const mockConfig = configFactory.build({
      label: randomLabel(),
      id: randomNumber(1000, 99999),
      interfaces: null,
    });

    const mockPublicInterface = linodeInterfaceFactoryPublic.build({
      id: randomNumber(1000, 99999),
    });

    const mockUpgradeLinodeInterface = upgradeLinodeInterfaceFactory.build({
      config_id: mockConfig.id,
      dry_run: true,
      interfaces: [mockPublicInterface],
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode);
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]);
    mockGetLinodeConfig(mockLinode.id, mockConfig);
    mockUpgradeNewLinodeInterface(mockLinode.id, mockUpgradeLinodeInterface);

    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
      'be.visible'
    );

    // "UPGRADE" button appears and works as expected.
    cy.findByText('Configuration Profile').should('be.visible');
    cy.findByText('UPGRADE').should('be.visible').click({ force: true });

    // Assert the prompt dialog content.
    assertPromptDialogContent();

    // Check "Dry Run" flow
    ui.dialog
      .findByTitle('Upgrade to Linode Interfaces')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle(dryRunButtonText)
          .should('be.visible')
          .should('be.enabled')
          .click();

        assertUpgradeSummay(mockPublicInterface, true);

        ui.button
          .findByTitle('Continue to Upgrade')
          .should('be.visible')
          .should('be.enabled')
          .click();

        assertUpgradeSummay(mockPublicInterface, false);

        ui.button.findByTitle('Close').should('be.visible').click();
      });

    // Check "Upgrade Interfaces" flow
    cy.findByText('UPGRADE').should('be.visible').click({ force: true });
    ui.dialog
      .findByTitle('Upgrade to Linode Interfaces')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle(upgradeInterfacesButtonText)
          .should('be.visible')
          .should('be.enabled')
          .click();

        assertUpgradeSummay(mockPublicInterface, false);

        ui.button.findByTitle('Close').should('be.visible').click();
      });
  });

  /*
   * - Confirm Linode with multiple configurations can be upgraded to new Linode Interfaces.
   */
  it('upgrades from multiple legacy configurations to new Linode interfaces from details page', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(1000, 99999),
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const mockConfig1 = configFactory.build({
      label: randomLabel(),
      id: randomNumber(1000, 99999),
      interfaces: null,
    });

    const mockConfig2 = configFactory.build({
      label: randomLabel(),
      id: randomNumber(1000, 99999),
      interfaces: null,
    });

    const mockPublicInterface = linodeInterfaceFactoryPublic.build({
      id: randomNumber(1000, 99999),
    });

    const mockUpgradeLinodeInterface = upgradeLinodeInterfaceFactory.build({
      config_id: mockConfig1.id,
      dry_run: true,
      interfaces: [mockPublicInterface],
    });

    mockGetLinodeDetails(mockLinode.id, mockLinode);
    mockGetLinodeConfigs(mockLinode.id, [mockConfig1, mockConfig2]);
    mockGetLinodeConfig(mockLinode.id, mockConfig1);
    mockUpgradeNewLinodeInterface(mockLinode.id, mockUpgradeLinodeInterface);

    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
      'be.visible'
    );

    // "UPGRADE" button appears and works as expected.
    cy.findByText('Configuration Profile').should('be.visible');
    cy.findByText('UPGRADE').should('be.visible').click({ force: true });

    // Assert the prompt dialog content.
    assertPromptDialogContent();

    // Check "Dry Run" flow
    ui.dialog
      .findByTitle('Upgrade to Linode Interfaces')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle(dryRunButtonText)
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Find the config select and open it
        cy.get('[placeholder="Select Configuration Profile"]')
          .should('be.visible')
          .click();
        cy.focused().type(`${mockConfig1.label}{enter}`);

        // Select the config
        ui.autocompletePopper
          .findByTitle(mockConfig1.label)
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm config select text for multiple configurations
        cy.findByText(configSelectSharedText, { exact: false }).should(
          'be.visible'
        );

        cy.findAllByText(dryRunButtonText)
          .last()
          .should('be.visible')
          .should('be.enabled')
          .click();

        assertUpgradeSummay(mockPublicInterface, true);

        ui.button
          .findByTitle('Continue to Upgrade')
          .should('be.visible')
          .should('be.enabled')
          .click();

        assertUpgradeSummay(mockPublicInterface, false);

        ui.button.findByTitle('Close').should('be.visible').click();
      });

    // Check "Upgrade Interfaces" flow
    cy.findByText('UPGRADE').should('be.visible').click({ force: true });
    ui.dialog
      .findByTitle('Upgrade to Linode Interfaces')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle(upgradeInterfacesButtonText)
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.findByText(configSelectSharedText).should('be.visible');

        // Find the config select and open it
        cy.get('[placeholder="Select Configuration Profile"]')
          .should('be.visible')
          .click();
        cy.focused().type(`${mockConfig1.label}{enter}`);

        // Select the config
        ui.autocompletePopper
          .findByTitle(mockConfig1.label)
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm multiple configuration warning text for multiple configurations
        cy.findByText(upgradeInterfacesWarningText).should('be.visible');

        cy.findAllByText(upgradeInterfacesButtonText)
          .last()
          .should('be.visible')
          .should('be.enabled')
          .click();

        assertUpgradeSummay(mockPublicInterface, false);

        ui.button.findByTitle('Close').should('be.visible').click();
      });
  });

  /*
   * - Confirm upgrade error flow.
   * - Confirm "Return to Overview" works.
   * - Confirm the error message shows up.
   */
  it('Displays error message when having upgrade issue', () => {
    const mockLinode = linodeFactory.build({
      id: randomNumber(1000, 99999),
      label: randomLabel(),
      region: chooseRegion().id,
    });

    const mockConfig = configFactory.build({
      label: randomLabel(),
      id: randomNumber(1000, 99999),
      interfaces: null,
    });

    const mockErrorMessage = 'Custom Error';

    mockGetLinodeDetails(mockLinode.id, mockLinode);
    mockGetLinodeConfigs(mockLinode.id, [mockConfig]);
    mockGetLinodeConfig(mockLinode.id, mockConfig);
    mockUpgradeNewLinodeInterfaceError(mockLinode.id, mockErrorMessage, 500).as(
      'upgradeError'
    );

    cy.visitWithLogin(`/linodes/${mockLinode.id}`);
    cy.contains('RUNNING', { timeout: LINODE_CREATE_TIMEOUT }).should(
      'be.visible'
    );

    // "UPGRADE" button appears and works as expected.
    cy.findByText('Configuration Profile').should('be.visible');
    cy.findByText('UPGRADE').should('be.visible').click({ force: true });

    ui.dialog
      .findByTitle('Upgrade to Linode Interfaces')
      .should('be.visible')
      .within(() => {
        // Check error flow
        ui.button
          .findByTitle(dryRunButtonText)
          .should('be.visible')
          .should('be.enabled')
          .click();

        // Confirm the error message shows up.
        cy.wait('@upgradeError');
        cy.findByText(mockErrorMessage).should('be.visible');
        cy.findByText(errorDryRunText).should('be.visible');

        // Confirm "Return to Overview" button back to the dialog.
        ui.button
          .findByTitle('Return to Overview')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    assertPromptDialogContent();
  });
});
