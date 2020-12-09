import strings from '../cypresshelpers';
import {
  apiCheckErrors,
  testTag,
  getAll,
  deleteById,
  isTestEntity,
  makeTestLabel
} from './common';

// import { getAll } from '../../../src/utilities/getAll';

const oauthtoken = Cypress.env('MANAGER_OAUTH');
const testLinodeTag = testTag;
export const makeRandomId = () => Math.floor(Math.random() * 99999999);
export const makeLinodeLabel = makeTestLabel;

export const makeLinodeDataWithStatus = status => {
  return {
    id: makeRandomId(),
    label: makeLinodeLabel(),
    group: 'cy-test',
    status,
    created: '2020-04-10T13:48:37',
    updated: '2020-04-10T13:50:33',
    type: 'g6-standard-6',
    ipv4: ['50.116.62.58'],
    ipv6: '2600:3ca3::f03c:92ff:fe7a:8361/64',
    image: 'linode/debian9-kube-v1.16.2',
    region: 'us-east',
    specs: {
      disk: 327680,
      memory: 16384,
      vcpus: 6,
      gpus: 0,
      transfer: 8000
    },
    alerts: {
      cpu: 540,
      network_in: 10,
      network_out: 10,
      transfer_quota: 80,
      io: 10000
    },
    backups: {
      enabled: true,
      schedule: { day: 'Scheduling', window: 'Scheduling' },
      last_successful: '2020-05-12T06:14:12'
    },
    hypervisor: 'kvm',
    watchdog_enabled: true,
    tags: []
  };
};

const makeLinodeCreateReq = (linode, password) => {
  const linodeData = linode
    ? linode
    : {
        root_pass: password ? password : strings.randomPass(),
        label: makeLinodeLabel(),
        type: 'g6-standard-2',
        region: 'us-east',
        image: 'linode/debian10',
        tags: [testLinodeTag],
        backups_enabled: false,
        booted: true,
        private_ip: true,
        authorized_users: []
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/linode/instances',
    body: linodeData,
    auth: {
      bearer: oauthtoken
    }
  });
};

export const makeLinodeCreateReqSpecifyRegion = (region, linode) => {
  const linodeData = linode
    ? linode
    : {
        root_pass: strings.randomPass(),
        label: makeLinodeLabel(),
        type: 'g6-standard-2',
        region,
        image: 'linode/debian10',
        tags: [testLinodeTag],
        backups_enabled: false,
        booted: true,
        private_ip: true,
        authorized_users: []
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/linode/instances',
    body: linodeData,
    auth: {
      bearer: oauthtoken
    }
  });
};

export const makeLinodeCreateReqWithBackupsEnabled = linode => {
  const linodeData = linode
    ? linode
    : {
        root_pass: strings.randomPass(),
        label: makeLinodeLabel(),
        type: 'g6-standard-2',
        region: 'us-east',
        image: 'linode/debian10',
        tags: [testLinodeTag],
        backups_enabled: true,
        booted: true,
        private_ip: true,
        authorized_users: []
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/linode/instances',
    body: linodeData,
    auth: {
      bearer: oauthtoken
    }
  });
};

/**
 *  Use this method if you do not need to get the request detail
 * if linode is undefined, will create default test debian linode in us-east
 * @param linode {label:'', tags:[],type:'',region:'',image:'',root_pass:''}
 */
export const createLinode = (linode = undefined, password = '') => {
  return makeLinodeCreateReq(linode, password).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Linode ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};
export const createLinodeSpecifyRegion = (
  region: string,
  linode = undefined
) => {
  return makeLinodeCreateReqSpecifyRegion(region, linode).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Linode ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};

export const createLinodeWithBackupsEnabled = (linode = undefined) => {
  return makeLinodeCreateReqWithBackupsEnabled(linode).then(resp => {
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
