export const apiTestEvent = {
  entity: 'linode-www2',
  status: 'finished',
  stackscript_id: null,
  updated: '2016-11-21T20:03:40',
  linode_id: 1237,
  read: false,
  seen: false,
  finished: null,
  percent_complete: 100,
  created: '2016-11-21T20:03:40',
  type: 'linode_reboot',
  id: 385,
  label_message: '',
  nodebalancer_id: null,
};

export const testEvent = {
  ...apiTestEvent,
  _polling: false,
};

export function makeEvent(eventType) {
  return {
    ...testEvent,
    type: eventType,
  };
}

export const linodeShutdownEvent = makeEvent('linode_shutdown');
export const linodeBootEvent = makeEvent('linode_boot');
export const unrecognizedEvent = makeEvent('unknown_unrecognized');

export const events = {
  385: testEvent,
  386: {
    ...testEvent,
    id: 386,
    read: true,
    updated: '2016-11-21T20:12:40',
    linode_id: 1237,
  },
  387: linodeShutdownEvent,
  388: linodeBootEvent,
};
