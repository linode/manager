import { createLinode, getLinodeConfigs } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@linode/utilities';
import { findOrCreateDependencyFirewall } from 'support/api/firewalls';
import { findOrCreateDependencyVlan } from 'support/api/vlans';
import { pageSize } from 'support/constants/api';
import {
  dryRunButtonText,
  promptDialogDescription1,
  promptDialogDescription2,
  promptDialogUpgradeDetails,
  promptDialogUpgradeWhatHappensTitle,
  upgradeInterfacesButtonText,
  legacyInterfacesDescriptionText1,
  legacyInterfacesDescriptionText2,
  legacyInterfacesLabelText,
  linodeInterfacesDescriptionText1,
  linodeInterfacesDescriptionText2,
  linodeInterfacesLabelText,
  networkConnectionDescriptionText,
  networkConnectionSectionText,
  networkInterfaceTypeSectionText,
} from 'support/constants/linode-interfaces';
import { LINODE_CREATE_TIMEOUT } from 'support/constants/linodes';
import { ui } from 'support/ui';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { pollLinodeDiskStatuses, pollLinodeStatus } from 'support/util/polling';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { depaginate } from './paginate';

import type {
  Config,
  CreateLinodeRequest,
  InterfacePayload,
  Linode,
  LinodeInterface,
} from '@linode/api-v4';

/**
 * Linode create interface to configure a Linode with no public internet access.
 */
export const linodeVlanNoInternetConfig: InterfacePayload[] = [
  {
    ipam_address: null,
    label: randomLabel(),
    primary: false,
    purpose: 'vlan',
  },
];

/**
 * Methods used to secure test Linodes.
 *
 * - `firewall`: A firewall is used to secure the created Linode. If a suitable
 *   firewall does not exist, one is created first.
 *
 * - `vlan_no_internet`: The created Linode's `eth0` network interface is set to
 *   a VLAN, and no public internet interface is configured.
 *
 * - `powered_off`: The created Linode is not booted upon creation.
 */
export type CreateTestLinodeSecurityMethod =
  | 'firewall'
  | 'powered_off'
  | 'vlan_no_internet';

/**
 * Options to control the behavior of test Linode creation.
 */
export interface CreateTestLinodeOptions {
  /** Method to use to secure the test Linode. */
  securityMethod: CreateTestLinodeSecurityMethod;

  /** Whether to wait for created Linode to boot before resolving. */
  waitForBoot: boolean;

  /** Whether to wait for created Linode disks to be available before resolving. */
  waitForDisks: boolean;
}

/**
 * Default test Linode creation options.
 */
export const defaultCreateTestLinodeOptions = {
  securityMethod: 'firewall',
  waitForBoot: false,
  waitForDisks: false,
};

/**
 * Creates a Linode to use during tests.
 *
 * @param createRequestPayload - Partial Linode request payload to override default payload.
 * @param options - Linode create and polling options.
 *
 * @returns Promise that resolves to the created Linode.
 */
export const createTestLinode = async (
  createRequestPayload?: null | Partial<CreateLinodeRequest>,
  options?: Partial<CreateTestLinodeOptions>
): Promise<Linode> => {
  const resolvedOptions = {
    ...defaultCreateTestLinodeOptions,
    ...(options || {}),
  };

  let regionId = createRequestPayload?.region;
  if (!regionId) {
    regionId = chooseRegion().id;
  }

  const securityMethodPayload: Partial<CreateLinodeRequest> =
    await (async () => {
      switch (resolvedOptions.securityMethod) {
        case 'firewall':
          const firewall = await findOrCreateDependencyFirewall();
          return {
            firewall_id: firewall.id,
          };

        case 'powered_off':
          return {
            booted: false,
          };

        case 'vlan_no_internet':
          const vlanConfig = linodeVlanNoInternetConfig;
          const vlanLabel = await findOrCreateDependencyVlan(regionId);
          vlanConfig[0].label = vlanLabel;
          return {
            interfaces: vlanConfig,
          };

        default:
          return {};
      }
    })();

  const resolvedCreatePayload = {
    ...createLinodeRequestFactory.build({
      interface_generation: 'legacy_config',
      firewall_id: null,
      booted: false,
      image: 'linode/ubuntu24.04',
      label: randomLabel(),
      region: regionId,
    }),
    ...(createRequestPayload || {}),
    ...securityMethodPayload,

    // Override given root password; mitigate against using default factory password, inadvertent logging, etc.
    root_pass: randomString(64, {
      lowercase: true,
      numbers: true,
      spaces: true,
      symbols: true,
      uppercase: true,
    }),
  };

  // Display warnings for certain combinations of options/request payloads...
  if (resolvedOptions.waitForDisks && resolvedOptions.waitForBoot) {
    console.warn(
      'Ignoring `waitForDisks` option because `waitForBoot` takes precedence.'
    );
  }

  if (!resolvedCreatePayload.booted && resolvedOptions.waitForBoot) {
    console.warn(
      'Using `waitForBoot` option when Linode payload `booted` is false will cause a timeout.'
    );
  }

  // eslint-disable-next-line @linode/cloud-manager/no-createLinode
  const linode = await createLinode(resolvedCreatePayload);

  // Wait for disks to become available if `waitForDisks` option is set.
  // We skip this step if `waitForBoot` is set, however, because waiting for boot
  // implicitly waits for disks.
  //
  if (resolvedOptions.waitForDisks && !resolvedOptions.waitForBoot) {
    // Wait 7.5 seconds before initial check, then poll again every 5 seconds.
    await pollLinodeDiskStatuses(
      linode.id,
      'ready',
      new SimpleBackoffMethod(5000, {
        initialDelay: 7500,
        maxAttempts: 25,
      })
    );
  }

  // Wait for Linode status to be 'running' if `waitForBoot` is true.
  if (resolvedOptions.waitForBoot) {
    await pollLinodeStatus(linode.id, 'running');
  }

  Cypress.log({
    consoleProps: () => {
      return {
        linode,
        options: resolvedOptions,
        payload: {
          ...resolvedCreatePayload,
          root_pass: '(redacted)',
        },
      };
    },
    message: `Create Linode '${linode.label}' (ID ${linode.id})`,
    name: 'createTestLinode',
    timeout: LINODE_CREATE_TIMEOUT,
  });

  return {
    ...linode,
    capabilities: [],
  };
};

/**
 * Retrieves all Config objects belonging to a Linode.
 *
 * @param linodeId - ID of Linode for which to retrieve Configs.
 *
 * @returns Promise that resolves to an array of Config objects for the given Linode.
 */
export const fetchLinodeConfigs = async (
  linodeId: number
): Promise<Config[]> => {
  return depaginate((page) =>
    getLinodeConfigs(linodeId, { page, page_size: pageSize })
  );
};

/**
 * Check the content of prompt dialog
 */
export const assertPromptDialogContent = () => {
  ui.dialog
    .findByTitle('Upgrade to Linode Interfaces')
    .should('be.visible')
    .within(() => {
      cy.findByText(promptDialogDescription1, { exact: false }).should(
        'be.visible'
      );
      cy.findByText(promptDialogDescription2, { exact: false }).should(
        'be.visible'
      );
      cy.findByText(promptDialogUpgradeWhatHappensTitle, {
        exact: false,
      }).should('be.visible');
      promptDialogUpgradeDetails.forEach((item) => {
        cy.findByText(item).should('be.visible');
      });

      ui.button
        .findByTitle(dryRunButtonText)
        .should('be.visible')
        .should('be.enabled');
      ui.button
        .findByTitle(upgradeInterfacesButtonText)
        .should('be.visible')
        .should('be.enabled');
    });
};

/**
 * Check the upgrade summary
 *
 * @param linodeInterface - Linode interface to check.
 * @param isDryRun - Boolean to indicate if the upgrade performs dry run.
 *
 */
export const assertUpgradeSummary = (
  linodeInterface: LinodeInterface,
  isDryRun: boolean = false
) => {
  if (isDryRun) {
    // Confirm that dry run status is successful
    cy.findByText('Dry run successful').should('be.visible');
    cy.findByText(
      'No issues were found. You can proceed with upgrading to Linode Interfaces.'
    ).should('be.visible');

    // Confirm that dry run summary details display.
    cy.findByText('Dry Run Summary').should('be.visible');
    cy.findByText('Interface Meta Info').should('be.visible');
    cy.findByText(`MAC Address: ${linodeInterface.mac_address}`).should(
      'be.visible'
    );
    cy.findByText(`Created: ${linodeInterface.created}`).should('be.visible');
    cy.findByText(`Updated: ${linodeInterface.updated}`).should('be.visible');
    cy.findByText(`Version: ${linodeInterface.version}`).should('be.visible');
    cy.findByText('Public Interface dry run successful.').should('be.visible');
  } else {
    // Confirm that upgrade status is successful
    cy.findByText('Upgrade successful').should('be.visible');
    cy.findByText(
      'Your Linode now uses Linode Interfaces. Existing interfaces were migrated, firewalls reassigned, and changes are visible',
      { exact: false }
    ).should('be.visible');

    // Confirm that upgrade summary details display.
    cy.findByText('Upgrade Summary').should('be.visible');
    cy.findByText(
      `Interface Meta Info: Interface #${linodeInterface.id}`
    ).should('be.visible');
    cy.findByText(`ID: ${linodeInterface.id}`).should('be.visible');
    cy.findByText(`MAC Address: ${linodeInterface.mac_address}`).should(
      'be.visible'
    );
    cy.findByText(`Created: ${linodeInterface.created}`).should('be.visible');
    cy.findByText(`Updated: ${linodeInterface.updated}`).should('be.visible');
    cy.findByText(`Version: ${linodeInterface.version}`).should('be.visible');
    cy.findByText('Public Interface successfully upgraded.').should(
      'be.visible'
    );
  }
};

/**
 * Check the elements of Linode Interfaces.
 *
 * @param linodeInterfacesEnabled - Indicator if Linode Interfaces feature is enabled.
 */
export const checkLinodeInterfacesElements = (
  linodeInterfacesEnabled: boolean = true
): void => {
  const expectedBehavior = linodeInterfacesEnabled ? 'be.visible' : 'not.exist';
  cy.findByText(networkInterfaceTypeSectionText).should(expectedBehavior);
  cy.findByText(linodeInterfacesLabelText).should(expectedBehavior);
  cy.findByText(linodeInterfacesDescriptionText1).should(expectedBehavior);
  cy.findByText(linodeInterfacesDescriptionText2).should(expectedBehavior);
  cy.findByText(legacyInterfacesLabelText).should(expectedBehavior);
  cy.findByText(legacyInterfacesDescriptionText1).should(expectedBehavior);
  cy.findByText(legacyInterfacesDescriptionText2).should(expectedBehavior);
  cy.findByText(networkConnectionSectionText).should(expectedBehavior);
  cy.findByText(networkConnectionDescriptionText).should(expectedBehavior);
};
