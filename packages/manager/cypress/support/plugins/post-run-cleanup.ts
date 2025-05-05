import {
  deleteFirewall,
  deleteKubernetesCluster,
  deleteLinode,
  getFirewalls,
  getKubernetesClusters,
  getLinodes,
  getNodePools,
} from '@linode/api-v4';
import { DateTime } from 'luxon';

import { depaginate } from '../util/paginate';

import type { CypressPlugin } from './plugin';
import type {
  Firewall,
  KubeNodePoolResponse,
  KubernetesCluster,
  Linode,
  PoolNodeResponse,
} from '@linode/api-v4';

// TODO Refactor to use utilities after M3-8803.
/*
 * Cypress configuration and plugins are executed in Node.js where our
 * path aliases `support`, `src`/`@src`, etc., are unavailable. Additionally,
 * some Cypress-specific objects like `cy` and `Cypress` are unavailable.
 *
 * As a result, we cannot import any code which uses aliases, uses `cy`/`Cypress`,
 * or imports any code which does (and so on...) from here. Because of this
 * limitation, we can't import our existing utilities related to resource clean
 * up and sadly must re-implement them here.
 *
 * M3-8803 seeks to reorganize our utilities to better distinguish which code
 * is executed and expected to be available where, and after that point we
 * should be able to refactor this plugin to take advantage of existing utilities
 * like `deleteAllTestLinodes`, `deleteAllTestFirewalls`, etc.
 */

// Test resource label/name prefix.
const TEST_TAG_PREFIX = 'cy-test-';

// Desired number of items per page of a paginated API request.
const PAGE_SIZE = 500;

/*
 * Determines if the given node pool is ready by checking the status of each node.
 */
const isPoolReady = (pool: KubeNodePoolResponse): boolean =>
  pool.nodes.every((node: PoolNodeResponse) => node.status === 'ready');

/**
 * Deletes all test Linodes on the test account.
 *
 * This is a re-implementation of an existing util, `deleteAllTestLinodes`, in
 * `support/api/linodes.ts`.
 *
 * @returns Promise that resolves when all test Linodes are deleted.
 */
const deleteTestLinodes = async () => {
  const allLinodes = await depaginate<Linode>((page) =>
    getLinodes({ page, page_size: PAGE_SIZE })
  );

  const deletePromises = allLinodes
    .filter((linode: Linode) => linode.label.startsWith(TEST_TAG_PREFIX))
    .map((linode: Linode) => deleteLinode(linode.id));

  await Promise.all(deletePromises);
};

/**
 * Deletes all test Firewalls on the test account.
 *
 * This is a re-implementation of an existing util, `deleteAllTestFirewalls`, in
 * `support/api/firewalls.ts`.
 *
 * @returns Promise that resolves when all test Firewalls are deleted.
 */
const deleteTestFirewalls = async () => {
  const allFirewalls = await depaginate<Firewall>((page) =>
    getFirewalls({ page, page_size: PAGE_SIZE })
  );

  const deletePromises = allFirewalls
    .filter((firewall: Firewall) => firewall.label.startsWith(TEST_TAG_PREFIX))
    .map((firewall: Firewall) => deleteFirewall(firewall.id));

  await Promise.all(deletePromises);
};

/**
 * Deletes all running test LKE clusters on the test account.
 *
 * Sometimes when attempting to delete provisioning LKE clusters, the cluster
 * becomes stuck and requires manual intervention to resolve. To reduce the risk
 * of this happening, this function will only delete clusters that have finished
 * provisioning (i.e. all nodes have `'ready'` status) or which have existed
 * for at least an hour.
 *
 * This is a re-implementation of an existing util, `deleteAllTestLkeClusters`, in
 * `support/api/lke.ts`.
 *
 * @returns Promise that resolves when all test LKE clusters are deleted.
 */
const deleteTestLkeClusters = async () => {
  const allClusters = await depaginate<KubernetesCluster>((page) =>
    getKubernetesClusters({ page, page_size: PAGE_SIZE })
  );

  const clusterDeletionPromises = allClusters
    .filter((cluster: KubernetesCluster) =>
      cluster.label.startsWith(TEST_TAG_PREFIX)
    )
    .map(async (cluster: KubernetesCluster) => {
      const clusterCreateTime = DateTime.fromISO(cluster.created, {
        zone: 'utc',
      });
      const createTimeElapsed = Math.abs(
        clusterCreateTime.diffNow('minutes').minutes
      );

      // If the test cluster is older than 1 hour, delete it regardless of
      // whether or not all of the Node Pools are ready; this is a safeguard
      // to prevent LKE clusters with stuck pools from accumulating.
      if (createTimeElapsed >= 60) {
        return deleteKubernetesCluster(cluster.id);
      }

      // If the cluster is not older than 1 hour, only delete it if all of its
      // Node Pools are ready.
      const pools = await depaginate<KubeNodePoolResponse>((page: number) =>
        getNodePools(cluster.id, { page, page_size: PAGE_SIZE })
      );
      if (pools.every(isPoolReady)) {
        return deleteKubernetesCluster(cluster.id);
      }
      return;
    });

  await Promise.all(clusterDeletionPromises);
};

/*
 * Human-friendly string describing the types of resources being deleted,
 * and their corresponding deletion function.
 */
const resourceCleanUpItems = [
  { name: 'Linodes', cleanUp: deleteTestLinodes },
  // TODO Remove LKE cluster clean up once M3-8656 is complete because cluster cleanup will no longer be necessary.
  { name: 'LKE Clusters', cleanUp: deleteTestLkeClusters },
  { name: 'Firewalls', cleanUp: deleteTestFirewalls },
];

export const postRunCleanup: CypressPlugin = async (on) => {
  on('after:run', async () => {
    console.log('Performing post-run clean up:\n');

    for (const resourceCleanUpItem of resourceCleanUpItems) {
      console.log(`- Cleaning up test ${resourceCleanUpItem.name}...`);
      try {
        // Perform clean-up sequentially.
        // eslint-disable-next-line no-await-in-loop
        await resourceCleanUpItem.cleanUp();
      } catch (e) {
        console.error(
          `\nAn error occurred while cleaning up test ${resourceCleanUpItem.name}:`
        );
        if (e.message) {
          console.error(e.message);
        }
        console.error(e);
      }
    }
    console.log('\nPost-run clean up is complete');
  });
};
