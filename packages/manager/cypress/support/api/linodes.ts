import strings from '../cypresshelpers';
import {
  apiCheckErrors,
  testTag,
  getAll,
  deleteById,
  isTestEntity,
  makeTestLabel
} from './common';

const oauthtoken = Cypress.env('MANAGER_OAUTH');
const testLinodeTag = testTag;
export const makeLinodeLabel = makeTestLabel;

const makeLinodeCreateReq = linode => {
  const linodeData = linode
    ? linode
    : {
        root_pass: strings.randomPass(12),
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

/**
 *  Use this method if you do not need to get the request detail
 * if linode is undefined, will create default test debian linode in us-east
 * @param linode {label:'', tags:[],type:'',region:'',image:'',root_pass:''}
 */
export const createLinode = (linode = undefined) => {
  return makeLinodeCreateReq(linode).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Linode ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};

export const getLinodes = () => getAll('linode/instances');

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
    resp.body.data.forEach(linode => {
      if (isTestEntity(linode)) {
        deleteLinodeById(linode.id);
      }
    });
  });
};
