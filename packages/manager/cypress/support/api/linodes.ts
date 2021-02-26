import strings from '../cypresshelpers';
import {
  apiCheckErrors,
  testTag,
  getAll,
  deleteById,
  isTestEntity,
  makeTestLabel,
} from './common';

import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes/types';

const oauthtoken = Cypress.env('MANAGER_OAUTH');
const testLinodeTag = testTag;

export const makeRandomId = () => Math.floor(Math.random() * 99999999);
export const makeLinodeLabel = makeTestLabel;

const defaultLinodeRequestBody: Partial<CreateLinodeRequest> = {
  type: 'g6-standard-2',
  tags: [testLinodeTag],
  private_ip: true,
  image: 'linode/debian10',
  region: 'us-east',
  booted: true,
  backups_enabled: false,
  authorized_users: [],
  root_pass: strings.randomPass(),
};

const linodeRequest = linodeData => {
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
  const label = makeLinodeLabel();
  return linodeRequest({ label, ...defaultLinodeRequestBody, ...data });
};

export const createLinode = (data = {}) => {
  return requestBody(data).then(resp => {
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
  getLinodes().then(resp => {
    const linodeToDelete = resp.body.data.find(l => l.label === label);
    deleteLinodeById(linodeToDelete.id);
  });
};

export const deleteAllTestLinodes = () => {
  getLinodes().then(resp => {
    const pages = resp.body.pages;
    for (let page = 1; page <= pages; page++) {
      getLinodes(page).then(resp => {
        resp.body.data.forEach(linode => {
          if (isTestEntity(linode)) {
            deleteLinodeById(linode.id);
          }
        });
      });
    }
  });
};

export const clickLinodeActionMenu = title => {
  cy.get(`[aria-label="Action menu for Linode ${title}"]`).click();
};

// not currently being used by active test but will need to be addressed at some point
// export const makeLinodeDataWithStatus = (
//   region,
//   booted,
//   backups,
//   image,
//   status,
//   linode,
//   password
// ) => {
//   const linodeData = linode
//     ? linode
//     : {
//         root_pass: password ? password : strings.randomPass(),
//         id: makeRandomId(),
//         label: makeLinodeLabel(),
//         group: 'cy-test',
//         status: status ? status : 'running',
//         created: '2020-04-10T13:48:37',
//         updated: '2020-04-10T13:50:33',
//         type: 'g6-standard-6',
//         ipv4: ['50.116.62.58'],
//         ipv6: '2600:3ca3::f03c:92ff:fe7a:8361/64',
//         image: 'linode/debian9-kube-v1.16.2',
//         region: region ? region : 'us-east',
//         specs: {
//           disk: 327680,
//           memory: 16384,
//           vcpus: 6,
//           gpus: 0,
//           transfer: 8000
//         },
//         alerts: {
//           cpu: 540,
//           network_in: 10,
//           network_out: 10,
//           transfer_quota: 80,
//           io: 10000
//         },
//         backups: {
//           enabled: true,
//           schedule: { day: 'Scheduling', window: 'Scheduling' },
//           last_successful: '2020-05-12T06:14:12'
//         },
//         hypervisor: 'kvm',
//         watchdog_enabled: true,
//         tags: []
//       };

//   return postReturn(linodeData);
// };
