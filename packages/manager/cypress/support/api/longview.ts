import { apiCheckErrors, isTestLabel } from './common';
import {
  LongviewClient,
  getLongviewClients,
  deleteLongviewClient,
} from '@linode/api-v4';
import { oauthToken, pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

/**
 * Deletes all Longview clients whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when clients have been deleted.
 */
export const deleteAllTestClients = async (): Promise<void> => {
  const clients = await depaginate<LongviewClient>((page: number) =>
    getLongviewClients({ page_size: pageSize, page })
  );

  const deletionPromises = clients
    .filter((client: LongviewClient) => isTestLabel(client.label))
    .map((client: LongviewClient) => deleteLongviewClient(client.id));

  await Promise.all(deletionPromises);
};

const makeClientCreateReq = (client, label) => {
  const linodeData = client
    ? client
    : {
        label,
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/longview/clients',
    body: linodeData,
    auth: {
      bearer: oauthToken,
    },
  });
};

export const createClient = (client = undefined, label) => {
  return makeClientCreateReq(client, label).then((resp) => {
    apiCheckErrors(resp);
    console.log(`Created Client ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};
