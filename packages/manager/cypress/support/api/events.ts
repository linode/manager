import mixin = require('mixin-deep');

const LINODE_DEFAULT_DATA = {
  id: 17950183,
  time_remaining: 0,
  seen: false,
  secondary_entity: null,
  created: '2018-12-02T20:21:11',
  action: 'linode_create',
  read: false,
  percent_complete: 100,
  username: 'test',
  rate: null,
  entity: {
    id: 17950183,
    label: 'linode11440645',
    type: 'linode',
    url: '/v4/linode/instances/11440645',
  },
  status: 'failed',
  duration: 0,
};
const makeEventData = (event) => {
  return { data: [event], page: 1, pages: 1, results: 1 };
};

export const stubLinodeEvent = (linodeData = undefined) => {
  const _linodeData = mixin(LINODE_DEFAULT_DATA, linodeData);
  cy.intercept('GET', '/v4/account/events*', makeEventData(_linodeData)).as(
    'event'
  );
  cy.wait('@event');
};

export const waitForEvent = (eventFilter, attempts = 10) => {
  cy.intercept('GET', '*/account/events*').as('event');
  let attempt = 0;
  const wait = () => {
    attempt++;
    cy.wait('@event').then((xhr) => {
      const data = xhr.response?.body.data;
      if (Array.isArray(data) && data.some(eventFilter)) {
        return;
      }
      if (attempt < attempts) {
        wait();
        return;
      }
      throw new Error(`Failed to wait for event after ${attempts} attempt(s)`);
    });
  };

  wait();
};
