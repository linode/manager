import { removeImage } from 'src/store/image/image.actions';
import {
  requestImages,
  requestImageForStore,
} from 'src/store/image/image.requests';
import { EventHandler } from 'src/store/types';

const imageEventsHandler: EventHandler = (event, dispatch) => {
  const { action } = event;

  switch (action) {
    case 'image_delete':
      return dispatch(removeImage(event.entity.id));

    /**
     * I don't love this, but we don't have a choice. disk_imagize entity is the Linode
     * where the disk resides, not the image (as one would expect).
     */
    case 'disk_imagize':
      if (event.status === 'failed' && event.secondary_entity) {
        return dispatch(removeImage(event.secondary_entity.id));
      }

      if (['finished', 'notification'].includes(event.status)) {
        return dispatch(requestImages());
      }

    case 'image_upload':
      if (event.status === 'finished') {
        return dispatch(requestImageForStore(`private/${event.entity?.id}`));
      }

    default:
      return;
  }
};

export default imageEventsHandler;
