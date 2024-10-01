import { authenticate } from 'support/api/authentication';
import { cleanUp } from 'support/util/cleanup';

/**
 * Deletes test Linodes, LKE Clusters, and Firewalls after the run finishes.
 *
 * Note that in some cases this function may fail to clean up all relevant
 * resources. For example, if the test run itself is cancelled mid-run or
 * if any of the API requests fail during the clean up process, resources
 * may still be left behind.
 */
export const postRunCleanUp = () => {
  authenticate();
  after(() => {
    cleanUp(['linodes', 'lke-clusters', 'firewalls']);
  });
};
