import { createLinode, getLinodeConfigs } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { pollLinodeDiskStatuses, pollLinodeStatus } from 'support/util/polling';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';
import { depaginate } from './paginate';
import { pageSize } from 'support/constants/api';

import type { Config, Linode } from '@linode/api-v4';
import type { CreateLinodeRequest } from '@linode/api-v4';

/**
 * Options to control the behavior of test Linode creation.
 */
export interface CreateTestLinodeOptions {
  /** Whether to wait for created Linode disks to be available before resolving. */
  waitForDisks: boolean;

  /** Whether to wait for created Linode to boot before resolving. */
  waitForBoot: boolean;
}

/**
 * Default test Linode creation options.
 */
export const defaultCreateTestLinodeOptions = {
  waitForDisks: false,
  waitForBoot: false,
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

  const resolvedCreatePayload = {
    ...createLinodeRequestFactory.build({
      label: randomLabel(),
      image: 'linode/debian11',
      region: chooseRegion().id,
      booted: false,
    }),
    ...(createRequestPayload || {}),
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
        payload: resolvedCreatePayload,
        linode,
      };
    },
  });

  return linode;
};

/**
 * Creates a Linode and waits for it to be in "running" state.
 *
 * Deprecated. Use `createTestLinode` with `waitForBoot` set to `true`.
 *
 * @param createPayload - Optional Linode create payload options.
 *
 * @deprecated
 *
 * @returns Promis that resolves when Linode is created and booted.
 */
export const createAndBootLinode = async (
  createPayload?: Partial<CreateLinodeRequest>
): Promise<Linode> => {
  console.warn(
    '`createAndBootLinode()` is deprecated. Use `createTestLinode()` instead.'
  );
  return createTestLinode(createPayload, { waitForBoot: true });
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
