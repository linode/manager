import { createLinode, getLinodeConfigs } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { pollLinodeStatus } from 'support/util/polling';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import type { Config, Linode } from '@linode/api-v4';

const linodeRequest = createLinodeRequestFactory.build({
  label: randomLabel(),
  region: chooseRegion().id,
});

/**
 *  Creates a Linode and waits for it to be in "running" state.
 */
export const createAndBootLinode = async (): Promise<Linode> => {
  const linode = await createLinode(linodeRequest);

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
  linodeRequestOverride = {},
  waitForLinodeToBeRunning = false,
}: {
  linodeRequestOverride?: Partial<Config>;
  waitForLinodeToBeRunning?: boolean;
}): Promise<[Linode, Config]> => {
  const linode = await createLinode({
    ...linodeRequest,
    ...linodeRequestOverride,
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

  // Throw if Linode has no config.
  if (!configs[0]) {
    throw new Error('Created Linode does not have any config');
  }

  return [linode, configs[0]];
};
