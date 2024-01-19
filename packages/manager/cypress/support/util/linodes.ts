import { createLinode, getLinodeConfigs } from '@linode/api-v4';
import type { CreateLinodeRequest } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { pollLinodeStatus, pollLinodeDiskStatuses } from 'support/util/polling';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import type { Config, Linode, LinodeConfigCreationData } from '@linode/api-v4';

/**
 * Creates a Linode and waits for it to be in "running" state.
 *
 * @param createPayload - Optional Linode create payload options.
 *
 * @returns Promis that resolves when Linode is created and booted.
 */
export const createAndBootLinode = async (
  createPayload?: Partial<CreateLinodeRequest>
): Promise<Linode> => {
  const payload = createLinodeRequestFactory.build({
    label: randomLabel(),
    region: chooseRegion().id,
    ...(createPayload ?? {}),
  });
  const linode = await createLinode(payload);

  await pollLinodeStatus(
    linode.id,
    'running',
    new SimpleBackoffMethod(5000, {
      initialDelay: 15000,
      maxAttempts: 25,
    })
  );

  return linode;
};

/**
 * Creates a Linode and returns the first config for that Linode.
 */
export const createLinodeAndGetConfig = async ({
  linodeConfigRequestOverride = {},
  waitForLinodeToBeRunning = false,
}: {
  linodeConfigRequestOverride?: Partial<Linode & LinodeConfigCreationData>;
  waitForLinodeToBeRunning?: boolean;
}): Promise<[Linode, Config]> => {
  const createPayload = createLinodeRequestFactory.build({
    label: randomLabel(),
    region: chooseRegion().id,
  });
  const linode = await createLinode({
    ...createPayload,
    ...linodeConfigRequestOverride,
  });

  const { data: configs } = await getLinodeConfigs(linode.id);

  // we may want the linode to be booted to interact with the config
  waitForLinodeToBeRunning &&
    (await pollLinodeStatus(
      linode.id,
      'running',
      new SimpleBackoffMethod(5000, {
        initialDelay: 15000,
        maxAttempts: 25,
      })
    ));

  // If we don't wait for the Linode to boot, we wait for the disks to be ready.
  // Wait 7.5 seconds, then poll the Linode disks every 5 seconds until they are ready.
  !waitForLinodeToBeRunning &&
    (await pollLinodeDiskStatuses(
      linode.id,
      'ready',
      new SimpleBackoffMethod(5000, {
        initialDelay: 7500,
        maxAttempts: 25,
      })
    ));

  // Throw if Linode has no config.
  if (!configs[0] || !linode.id) {
    throw new Error('Created Linode does not have any config');
  }

  return [linode, configs[0]];
};
