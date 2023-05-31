import { isTestLabel } from './common';
import { oauthToken, pageSize } from 'support/constants/api';
import { entityTag } from 'support/constants/cypress';
import { randomLabel } from 'support/util/random';
import {
  getNodeBalancers,
  deleteNodeBalancer,
  NodeBalancer,
} from '@linode/api-v4';
import { depaginate } from 'support/util/paginate';
import { chooseRegion } from 'support/util/regions';

export const makeNodeBalCreateReq = (nodeBal) => {
  const nodeBalData = nodeBal
    ? nodeBal
    : {
        client_conn_throttle: 0,
        label: randomLabel(),
        tags: [entityTag],
        region: chooseRegion().id,
        configs: [],
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/v4/nodebalancers',
    body: nodeBalData,
    auth: {
      bearer: oauthToken,
    },
  });
};

/**
 * Deletes all NodeBalancers whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when NodeBalancers have been deleted.
 */
export const deleteAllTestNodeBalancers = async (): Promise<void> => {
  const nodeBalancers = await depaginate<NodeBalancer>((page: number) =>
    getNodeBalancers({ page_size: pageSize, page })
  );

  const deletePromises = nodeBalancers
    .filter((nodeBalancer) => isTestLabel(nodeBalancer.label))
    .map((nodeBalancer) => deleteNodeBalancer(nodeBalancer.id));

  await Promise.all(deletePromises);
};
