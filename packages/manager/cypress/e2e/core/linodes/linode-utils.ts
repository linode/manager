import { createLinode } from '@linode/api-v4';
import { createLinodeRequestFactory } from '@src/factories';
import { SimpleBackoffMethod } from 'support/util/backoff';
import { pollLinodeStatus } from 'support/util/polling';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

/**
 *  Creates a Linode and waits for it to be in "running" state.
 */
export const createAndBootLinode = async () => {
  const linodeRequest = createLinodeRequestFactory.build({
    label: randomLabel(),
    region: chooseRegion().id,
  });

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
