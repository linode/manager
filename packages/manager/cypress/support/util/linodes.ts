import { createLinode, getLinodeConfigs } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { pollLinodeDiskStatuses, pollLinodeStatus } from 'support/util/polling';
import { randomLabel, randomString } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { depaginate } from './paginate';
import { pageSize } from 'support/constants/api';

import type { Config, CreateLinodeRequest, Linode } from '@linode/api-v4';
import { findOrCreateDependencyFirewall } from 'support/api/firewalls';

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
  | 'vlan_no_internet'
  | 'powered_off';

/**
 * Options to control the behavior of test Linode creation.
 */
export interface CreateTestLinodeOptions {
  /** Whether to wait for created Linode disks to be available before resolving. */
  waitForDisks: boolean;

  /** Whether to wait for created Linode to boot before resolving. */
  waitForBoot: boolean;

  /** Method to use to secure the test Linode. */
  securityMethod: CreateTestLinodeSecurityMethod;
}

/**
 * Default test Linode creation options.
 */
export const defaultCreateTestLinodeOptions = {
  waitForDisks: false,
  waitForBoot: false,
  securityMethod: 'firewall',
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
  createRequestPayload?: Partial<CreateLinodeRequest> | null,
  options?: Partial<CreateTestLinodeOptions>
): Promise<Linode> => {
  const resolvedOptions = {
    ...defaultCreateTestLinodeOptions,
    ...(options || {}),
  };

  const securityMethodPayload: Partial<CreateLinodeRequest> = await (async () => {
    switch (resolvedOptions.securityMethod) {
      case 'firewall':
      default:
        const firewall = await findOrCreateDependencyFirewall();
        return {
          firewall_id: firewall.id,
        };

      case 'vlan_no_internet':
        return {
          interfaces: [
            {
              purpose: 'vlan',
              primary: false,
              label: randomLabel(),
              ipam_address: null,
            },
          ],
        };

      case 'powered_off':
        return {
          booted: false,
        };
    }
  })();

  const resolvedCreatePayload = {
    ...createLinodeRequestFactory.build({
      label: randomLabel(),
      image: 'linode/debian11',
      region: chooseRegion().id,
      booted: false,
    }),
    ...(createRequestPayload || {}),
    ...securityMethodPayload,

    // Override given root password; mitigate against using default factory password, inadvertent logging, etc.
    root_pass: randomString(64, {
      spaces: true,
      symbols: true,
      numbers: true,
      lowercase: true,
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
    // Wait 15 seconds before initial check, then poll again every 5 seconds.
    await pollLinodeStatus(
      linode.id,
      'running',
      new SimpleBackoffMethod(5000, {
        initialDelay: 15000,
        maxAttempts: 25,
      })
    );
  }

  Cypress.log({
    name: 'createTestLinode',
    message: `Create Linode '${linode.label}' (ID ${linode.id})`,
    consoleProps: () => {
      return {
        options: resolvedOptions,
        payload: {
          ...resolvedCreatePayload,
          root_pass: '(redacted)',
        },
        linode,
      };
    },
  });

  return linode;
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
