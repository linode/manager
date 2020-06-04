import {
  getAll,
  deleteById,
  makeTestLabel,
  testNamePrefix,
  apiCheckErrors
} from './common';

const oauthtoken = Cypress.env('MANAGER_OAUTH');
const relativeApiPath = '/domains';
export const makeRandomIP = () => {
  const _mf = () => Math.floor(Math.random() * 254);
  return `${_mf()}.${_mf()}.${_mf()}.${_mf()}`;
};
export const makeDomainLabel = () => makeTestLabel() + '.net';

export const getDomains = () => getAll(relativeApiPath);

export const deleteDomainById = id => deleteById(relativeApiPath, id);

export const isTestDomain = label => label.startsWith(testNamePrefix);

export const deleteAllTestDomains = () => {
  getDomains().then(resp => {
    resp.body.data.forEach(domain => {
      if (isTestDomain(domain.domain)) {
        deleteDomainById(domain.id);
      }
    });
  });
};

const makeDomainCreateReq = domain => {
  const domainData = domain
    ? domain
    : {
        domain: makeDomainLabel(),
        type: 'master',
        soa_email: 'admin@example.com'
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/domains',
    body: domainData,
    auth: {
      bearer: oauthtoken
    }
  });
};

// / Use this method if you do not need to get the request detail
// if linode is undefined, will create default test debian linode in us-east
// / @param linode {label:'', tags:[],type:'',region:'',image:'',root_pass:''}
export const createDomain = (domain = undefined) => {
  return makeDomainCreateReq(domain).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Domain ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};
