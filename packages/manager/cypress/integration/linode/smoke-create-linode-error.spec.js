import '@testing-library/cypress/add-commands';

const makeEvFail=(action)=>{return {
  id: 17950183,
  time_remaining: 0,
  seen: false,
  secondary_entity: null,
  created: '2018-12-02T20:21:11',
  action: action,
  read: false,
  percent_complete: 100,
  username: 'test',
  rate: null,
  entity: {
    id: 11440645,
    label: 'linode11440645',
    type: 'linode',
    url: '/v4/linode/instances/11440645'
  },
  status: 'failed',
  duration: 0
}}
const makeEventData=(event)=>{return {data:[event],pages:1,page:1,results:1}}


const checkToastError = (action,message)=>{
  cy.route({
    url:'/v4/account/events*',
    method:'GET',
    response:makeEventData(makeEvFail(action))
  }).as('event');
  cy.wait('@event');
  cy.get('[data-qa-toast]').within(e=>cy.findByText(message, {exact:false}).should('exist'));
}

describe('check toas messages', () => {
  beforeEach(() => {
    cy.login2();
    cy.visit('/linodes');
    cy.server();
  });
  it('linode_config_create', () => {
    checkToastError('linode_config_create','Error creating config');
  });
  it('disk_delete', () => {
    checkToastError('disk_delete','Unable to delete Disk');
  });
});
