import { apiCheckErrors, deleteById, getAll, isTestEntity } from './common';
const oauthtoken = Cypress.env('MANAGER_OAUTH');

export const getClients = () => getAll('longview/clients');

export const deleteClientById = (clientId: number) =>
  deleteById('longview/clients', clientId);

export const deleteAllTestClients = () => {
  getClients().then(resp => {
    resp.body.data.forEach(client => {
      if (isTestEntity(client)) {
        deleteClientById(client.id);
      }
    });
  });
};

const makeClientCreateReq = (client, label) => {
  const linodeData = client
    ? client
    : {
        label
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/longview/clients',
    body: linodeData,
    auth: {
      bearer: oauthtoken
    }
  });
};

export const createClient = (client = undefined, label) => {
  return makeClientCreateReq(client, label).then(resp => {
    apiCheckErrors(resp);
    console.log(`Created Linode ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};
