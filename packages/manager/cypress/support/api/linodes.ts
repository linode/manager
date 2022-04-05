import {
  apiCheckErrors,
  testTag,
  getAll,
  deleteById,
  isTestEntity,
} from './common';
import { randomLabel, randomString } from 'support/util/random';

import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes/types';
import { linodeFactory } from '@src/factories';
import { makeResourcePage } from '@src/mocks/serverHandlers';

const oauthtoken = Cypress.env('MANAGER_OAUTH');
const testLinodeTag = testTag;

export const createMockLinodeList = (data?: {}, listNumber: number = 1) => {
  return makeResourcePage(
    linodeFactory.buildList(listNumber, {
      ...data,
    })
  );
};

const defaultLinodeRequestBody: Partial<CreateLinodeRequest> = {
  type: 'g6-standard-2',
  tags: [testLinodeTag],
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
      bearer: oauthtoken,
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

export const getLinodes = (page: number = 1) =>
  getAll(`linode/instances?page=${page}`);

export const deleteLinodeById = (linodeId: number) =>
  deleteById('linode/instances', linodeId);

export const deleteLinodeByLabel = (label = undefined) => {
  getLinodes().then((resp) => {
    const linodeToDelete = resp.body.data.find((l) => l.label === label);
    deleteLinodeById(linodeToDelete.id);
  });
};

export const deleteAllTestLinodes = () => {
  getLinodes().then((resp) => {
    const pages = resp.body.pages;
    for (let page = 1; page <= pages; page++) {
      getLinodes(page).then((resp) => {
        resp.body.data.forEach((linode) => {
          if (isTestEntity(linode)) {
            deleteLinodeById(linode.id);
          }
        });
      });
    }
  });
};

export const clickLinodeActionMenu = (title) => {
  cy.get(`[aria-label="Action menu for Linode ${title}"]`).click();
};
