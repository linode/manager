import { deleteNodeBalancer, getNodeBalancers } from '@linode/api-v4';
import { nodeBalancerFactory } from '@linode/utilities';
import { oauthToken, pageSize } from 'support/constants/api';
import { entityTag } from 'support/constants/cypress';
import { depaginate } from 'support/util/paginate';
import { randomLabel } from 'support/util/random';
import { chooseRegion } from 'support/util/regions';

import { isTestLabel } from './common';

import type { NodeBalancer } from '@linode/api-v4';

export const makeNodeBalCreateReq = (nodeBal: NodeBalancer) => {
  const nodeBalData = nodeBal
    ? nodeBal
    : nodeBalancerFactory.build({
        client_conn_throttle: 0,
        label: randomLabel(),
        region: chooseRegion().id,
        tags: [entityTag],
      });

  return cy.request({
    auth: {
      bearer: oauthToken,
    },
    body: nodeBalData,
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/v4/nodebalancers',
  });
};

/**
 * Deletes all NodeBalancers whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when NodeBalancers have been deleted.
 */
export const deleteAllTestNodeBalancers = async (): Promise<void> => {
  const nodeBalancers = await depaginate<NodeBalancer>((page: number) =>
    getNodeBalancers({ page, page_size: pageSize })
  );

  const deletePromises = nodeBalancers
    .filter((nodeBalancer) => isTestLabel(nodeBalancer.label))
    .map((nodeBalancer) => deleteNodeBalancer(nodeBalancer.id));

  await Promise.all(deletePromises);
};
