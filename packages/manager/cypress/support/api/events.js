const makeEvent = (action, status) => {
  return {
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
    status: status,
    duration: 0
  };
};
const makeEventData = event => {
  return { data: [event], page: 1, pages: 1, results: 1 };
};

export const stubEvent = (action, status) => {
  cy.route({
    method: 'GET',
    response: makeEventData(makeEvent(action, status)),
    url: '/v4/account/events*'
  }).as('event');
  cy.wait('@event');
};
