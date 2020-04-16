import {
  apiCheckErrors,
  testTag,
  getAll,
  deleteById,
  isTestEntity,
  makeTestLabel
} from './common';
export const testNodeBalTag = testTag;
export const makeNodeBalLabel = makeTestLabel;

const makeNodeBalCreateReq = nodeBal => {
  const nodeBalData = nodeBal
    ? nodeBal
    : {
    client_conn_throttle: 0,
    label: makeNodeBalLabel(),
    tags: [testNodeBalTag],
    region: "us-east",
    configs:[]
  };

  return cy.request({
    method: 'POST',
    url: Cypress.env('apiroot') + '/v4/nodebalancers',
    body: nodeBalData,
    auth: {
      bearer: Cypress.env('oauthtoken')
    }
  });
};

/// Use this method if you do not need to get the request detail
// if linode is undefined, will create default test debian linode in us-east
/// @param linode {label:'', tags:[],type:'',region:'',image:'',root_pass:''}
export const createLinode = (linode = undefined) => {
  return makeNodeBalCreateReq(linode).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Linode ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};

export const getNodeBalancers = () => getAll('nodebalancers');

export const deleteNodeBalancerById = nodeBalId =>
  deleteById('nodebalancers', nodeBalId);


export const deleteNodeBalancerByLabel = (label = undefined) => {
  getNodeBalancers().then(resp => {
    cy.log('get all nb',resp.body.data);
    const nodeBalToDelete = resp.body.data.find(nb => nb.label === label);
    cy.log('to delete',nodeBalToDelete)
    deleteNodeBalancerById(nodeBalToDelete.id);
  });
};

export const deleteAllTestNodeBalancers = () => {
  getNodeBalancers().then(resp => {
    resp.body.data.forEach(nodeBal => {
      if (isTestEntity(nodeBal)) deleteNodeBalancerById(nodeBal.id);
    });
  });
};
