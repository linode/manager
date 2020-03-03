import strings from '../cypresshelpers';
const testLinodeTag = 'cy-test';
const testLinodeNamePrefix = 'cy-test-';

export const makeLinodeLabel = () =>
  testLinodeNamePrefix + strings.randomTitle(10);

export const apiCheckErrors = (resp, failOnError = true) => {
  let errs = undefined;
  if (resp.body && resp.body.ERRORARRAY && resp.body.ERRORARRAY.length > 0) {
    errs = resp.body.ERRORARRAY;
  }
  if (failOnError) {
    if (errs) {
      expect(errs[0].ERRORMESSAGE).not.to.be.exist;
    } else {
      expect(!!errs).to.be.false;
    }
  }
  return errs;
};

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
        private_ip: false,
        authorized_users: []
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('apiroot') + '/v4/linode/instances',
    body: linodeData,
    auth: {
      bearer: Cypress.env('oauthtoken')
    }
  });
};

/// Use this method if you do not need to get the request detail
// if linode is undefined, will create default test debian linode in us-east
/// @param linode {label:'', tags:[],type:'',region:'',image:'',root_pass:''}
export const createLinode = (linode = undefined) => {
  return makeLinodeCreateReq(linode).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Linode ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};

export const getLinodes = () => {
  return cy.request({
    method: 'GET',
    url: Cypress.env('apiroot') + '/v4/linode/instances',
    auth: {
      bearer: Cypress.env('oauthtoken')
    }
  });
};
export const deleteLinodeById = linodeId => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiroot')}/v4/linode/instances/${linodeId}`,
    auth: {
      bearer: Cypress.env('oauthtoken')
    }
  });
};

export const deleteLinodeByLabel = (label = undefined) => {
  getLinodes().then(resp => {
    const linodeToDelete = resp.body.data.find(l => l.label == label);
    deleteLinodeById(linodeToDelete.id);
  });
};

export const deleteAllTestLinodes = () => {
  getLinodes().then(resp => {
    resp.body.data.forEach(linode => {
      if (linode.tags.includes(testLinodeTag)) deleteLinodeById(linode.id);
    });
  });
};
