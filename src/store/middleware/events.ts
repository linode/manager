import { Dispatch, Middleware } from 'redux';
import { isType } from 'typescript-fsa';
import { addEvents } from '../reducers/events';
import { actions, async } from '../reducers/resources/linodes';


const { deleteLinode } = actions;
const { requestLinodeForStore, updateLinodeInStore } = async;

const middleware: Middleware = ({ dispatch }) => (next: Dispatch<any>) => (action: any) => {
  if (isType(action, addEvents)) {
    const { payload } = action;

    const newEvents = payload.filter(e => !e._initial);

    const len = newEvents.length
    let i = 0;

    for (; i < len; i++) {
      const event = newEvents[i];
      responseToEvent(dispatch, event);
    }
  }

  next(action);
};

export default middleware;

const responseToEvent = (dispatch: Dispatch<any>, event: Linode.Event) => {
  const { action, entity } = event;

  if (!entity) {
    return;
  }

  const { id } = entity;

  switch (action) {

    /** Update Linode */
    case 'linode_migrate':
    case 'linode_reboot':
    case 'linode_rebuild':
    case 'linode_shutdown':
    case 'linode_snapshot':
    case 'linode_addip':
    case 'linode_boot':
      return dispatch(updateLinodeInStore(id));

    /** Remove Linode */
    case 'linode_delete':
      return dispatch(deleteLinode(id))

    /** Create Linode */
    case 'linode_create':
    case 'linode_clone':
      return dispatch(requestLinodeForStore(id));


    default:
      return;
  }
};
