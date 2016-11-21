export const apiTestEvent = {
  label: 'Reboot Linode linode-www2',
  status: 'finished',
  stackscript_id: null,
  updated: '2016-11-21T20:03:40',
  linode_id: 2019675,
  read: false,
  finished: null,
  percent_complete: 100,
  created: '2016-11-21T20:03:40',
  event_type: 'linode_reboot',
  id: 385,
  label_message: '',
  nodebalancer_id: null,
};

export const testEvent = {
  ...apiTestEvent,
  _polling: false,
};

export const events = {
  385: testEvent,
  386: {
    ...testEvent,
    id: 386,
    read: true,
    updated: '2016-11-21T20:12:40',
    linode_id: 2019677,
  },
};
