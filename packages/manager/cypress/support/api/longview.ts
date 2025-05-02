import { deleteLongviewClient, getLongviewClients } from '@linode/api-v4';
import { oauthToken, pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { apiCheckErrors, isTestLabel } from './common';

import type { LongviewClient } from '@linode/api-v4';

/**
 * Deletes all Longview clients whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when clients have been deleted.
 */
export const deleteAllTestClients = async (): Promise<void> => {
  const clients = await depaginate<LongviewClient>((page: number) =>
    getLongviewClients({ page, page_size: pageSize })
  );

  const deletionPromises = clients
    .filter((client: LongviewClient) => isTestLabel(client.label))
    .map((client: LongviewClient) => deleteLongviewClient(client.id));

  await Promise.all(deletionPromises);
};

const makeClientCreateReq = (
  client: LongviewClient | undefined,
  label: string
) => {
  const linodeData = client
    ? client
    : {
        label,
      };

  return cy.request({
    auth: {
      bearer: oauthToken,
    },
    body: linodeData,
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/longview/clients',
  });
};

export const createClient = (
  client: LongviewClient | undefined,
  label: string
) => {
  return makeClientCreateReq(client, label).then((resp) => {
    apiCheckErrors(resp);
    console.log(`Created Client ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};
