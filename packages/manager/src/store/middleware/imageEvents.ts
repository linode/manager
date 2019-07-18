import { removeImage } from 'src/store/image/image.actions';
import { requestImages } from 'src/store/image/image.requests';
import { EventHandler } from 'src/store/types';

const imageEventsHandler: EventHandler = (event, dispatch) => {
  const { action } = event;

  switch (action) {
    case 'image_delete':
      return dispatch(removeImage(event.entity.id));

    /**
     * I don't love this, but we dont have a choice. disk_imagize entity is the Linode
     * where the disk resides, not the image (as one would expect).
     */
    case 'disk_imagize':
      if (['finished', 'notification'].includes(event.status)) {
        return dispatch(requestImages());
      }

    default:
      return;
  }
};

export default imageEventsHandler;
