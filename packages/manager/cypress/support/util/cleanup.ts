import { deleteAllTestDomains } from 'support/api/domains';
import { cancelAllTestEntityTransfers } from 'support/api/entityTransfer';
import { deleteAllTestFirewalls } from 'support/api/firewalls';
import { deleteAllTestImages } from 'support/api/images';
import { deleteAllTestLinodes } from 'support/api/linodes';
import { deleteAllTestLkeClusters } from 'support/api/lke';
import { deleteAllTestClients } from 'support/api/longview';
import { deleteAllTestNodeBalancers } from 'support/api/nodebalancers';
import {
  deleteAllTestAccessKeys,
  deleteAllTestBuckets,
} from 'support/api/objectStorage';
import { deleteAllTestStackScripts } from 'support/api/stackscripts';
import { deleteAllTestTags } from 'support/api/tags';
import { deleteAllTestVolumes } from 'support/api/volumes';
import { deleteAllTestSSHKeys } from 'support/api/profile';

/** Types of resources that can be cleaned up. */
export type CleanUpResource =
  | 'domains'
  | 'firewalls'
  | 'images'
  | 'linodes'
  | 'lke-clusters'
  | 'longview-clients'
  | 'node-balancers'
  | 'obj-access-keys'
  | 'obj-buckets'
  | 'service-transfers'
  | 'stackscripts'
  | 'ssh-keys'
  | 'tags'
  | 'volumes';

/** Object that maps resources to their corresponding clean up function. */
type CleanUpMap = {
  [key in CleanUpResource]: () => Promise<void>;
};

// Map `CleanUpResource` strings to the clean up functions they execute.
const cleanUpMap: CleanUpMap = {
  domains: () => deleteAllTestDomains(),
  firewalls: () => deleteAllTestFirewalls(),
  images: () => deleteAllTestImages(),
  linodes: () => deleteAllTestLinodes(),
  'lke-clusters': () => deleteAllTestLkeClusters(),
  'longview-clients': () => deleteAllTestClients(),
  'node-balancers': () => deleteAllTestNodeBalancers(),
  'obj-access-keys': () => deleteAllTestAccessKeys(),
  'obj-buckets': () => deleteAllTestBuckets(),
  'service-transfers': () => cancelAllTestEntityTransfers(),
  stackscripts: () => deleteAllTestStackScripts(),
  'ssh-keys': () => deleteAllTestSSHKeys(),
  tags: () => deleteAllTestTags(),
  volumes: () => deleteAllTestVolumes(),
};

/**
 * Cleans up test resources of the given type(s).
 *
 * @param resources - Types of resources to clean up.
 *
 * @example
 * await cleanUp('linodes'); // Clean up a single type of resource.
 * await cleanUp(['linodes', 'volumes']); // Clean up Linodes and then Volumes.
 *
 * @returns Promise that resolves when desired resources are cleaned up.
 */
export const cleanUp = (resources: CleanUpResource | CleanUpResource[]) => {
  const resourcesArray = Array.isArray(resources) ? resources : [resources];
  const promiseGenerator = async () => {
    for (const resource of resourcesArray) {
      const cleanFunction = cleanUpMap[resource];
      // Perform clean-up sequentially to avoid API rate limiting.
      // eslint-disable-next-line no-await-in-loop
      await cleanFunction();
    }
  };
  return cy.defer(
    promiseGenerator,
    `cleaning up test resources: ${resourcesArray.join(', ')}`
  );
};
