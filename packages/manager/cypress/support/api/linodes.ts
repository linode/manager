import { apiCheckErrors, deleteById, isTestLabel } from './common';

import { CreateLinodeRequest } from '@linode/api-v4/types';
import { linodeFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';
import { oauthToken, pageSize } from 'support/constants/api';
import { entityTag } from 'support/constants/cypress';
import { getLinodes, Linode, deleteLinode } from '@linode/api-v4';
import { depaginate } from 'support/util/paginate';
import { randomLabel, randomString } from 'support/util/random';

export const createMockLinodeList = (data?: {}, listNumber: number = 1) => {
  return makeResourcePage(
    linodeFactory.buildList(listNumber, {
      ...data,
    })
  );
};

const defaultLinodeRequestBody: Partial<CreateLinodeRequest> = {
  type: 'g6-standard-2',
  tags: [entityTag],
  private_ip: true,
  image: 'linode/debian10',
  region: 'us-east',
  booted: true,
  backups_enabled: false,
  authorized_users: [],
  root_pass: randomString(32),
};

const linodeRequest = (linodeData) => {
  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/linode/instances',
    body: linodeData,
    auth: {
      bearer: oauthToken,
    },
  });
};

export const requestBody = (data: Partial<CreateLinodeRequest>) => {
  const label = randomLabel();
  return linodeRequest({ label, ...defaultLinodeRequestBody, ...data });
};

export const createLinode = (data = {}) => {
  return requestBody(data).then((resp) => {
    apiCheckErrors(resp);
    console.log(`Created Linode ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};

export const deleteLinodeById = (linodeId: number) =>
  deleteById('linode/instances', linodeId);

/**
 * Deletes all Linodes whose labels are prefixed "cy-test-".
 *
 * @returns Promise that resolves when Linodes have been deleted or rejects on HTTP error.
 */
export const deleteAllTestLinodes = async (): Promise<void> => {
  const linodes = await depaginate<Linode>((page: number) =>
    getLinodes({ page_size: pageSize, page })
  );

  const deletePromises = linodes
    .filter((linode: Linode) => isTestLabel(linode.label))
    .map((linode: Linode) => deleteLinode(linode.id));

  await Promise.all(deletePromises);
};
