import { actions, async } from 'src/store/reducers/resources/images';
import { EventHandler } from './combineEventsMiddleware';

const imageEventsHandler: EventHandler = (event, dispatch) => {
  const { action } = event;

  switch (action) {
    case 'image_delete':
    return dispatch(actions.removeImage(event.entity.id));

    /**
     * I don't love this, but we dont have a choice. disk_imagize entity is the Linode
     * where the disk resides, not the image (as one would expect).
     */
    case 'disk_imagize':
      if (['finished', 'notification'].includes(event.status)) {
        return dispatch(async.requestImages());
      }

    default:
      return;
  }
};

export default imageEventsHandler;
