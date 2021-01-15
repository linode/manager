import {
  testTag,
  getAll,
  deleteById,
  isTestEntity,
  makeTestLabel
} from './common';
export const testNodeBalTag = testTag;
export const makeNodeBalLabel = makeTestLabel;

export const makeNodeBalCreateReq = nodeBal => {
  const nodeBalData = nodeBal
    ? nodeBal
    : {
        client_conn_throttle: 0,
        label: makeNodeBalLabel(),
        tags: [testNodeBalTag],
        region: 'us-east',
        configs: []
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/v4/nodebalancers',
    body: nodeBalData,
    auth: {
      bearer: Cypress.env('MANAGER_OAUTH')
    }
  });
};

export const getNodeBalancers = () => getAll('nodebalancers');

export const deleteNodeBalancerById = nodeBalId =>
  deleteById('nodebalancers', nodeBalId);

export const deleteNodeBalancerByLabel = (label: string = '') => {
  getNodeBalancers().then(resp => {
    cy.log('get all nb', resp.body.data);
    const nodeBalToDelete = resp.body.data.find(nb => nb.label === label);
    cy.log('to delete', nodeBalToDelete);
    deleteNodeBalancerById(nodeBalToDelete.id);
  });
};

export const deleteAllTestNodeBalancers = () => {
  getNodeBalancers().then(resp => {
    resp.body.data.forEach(nodeBal => {
      if (isTestEntity(nodeBal)) {
        deleteNodeBalancerById(nodeBal.id);
      }
    });
  });
};
