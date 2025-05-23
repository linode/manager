import { useGrants, useProfile } from '@linode/queries';
import { getEntityIdsByPermission } from '@linode/utilities';

import type { Event, Grants, Image, Linode } from '@linode/api-v4';
import type { DisableItemOption } from '@linode/ui';

export const useImageAndLinodeGrantCheck = () => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  // MORE CHECKS FOR RESTRICTED USE CASES
  const canCreateImage =
    Boolean(!profile?.restricted) || Boolean(grants?.global?.add_images);

  // console.log('canCreateImage:: ', canCreateImage);

  // IMPORTANT!!!!
  // Unrestricted users can select Images from any disk;
  //
  // Restricted users need read_write on the Linode they're trying to Imagize
  // (in addition to the global add_images grant).
  const permissionedLinodes = profile?.restricted
    ? (grants?.linode
        .filter((thisGrant) => thisGrant.permissions === 'read_write')
        .map((thisGrant) => thisGrant.id) ?? [])
    : null;

  return { canCreateImage, permissionedLinodes };
};

export const getImageLabelForLinode = (linode: Linode, images: Image[]) => {
  const image = images?.find((image) => image.id === linode.image);
  return image?.label ?? linode.image;
};

export const getEventsForImages = (images: Image[], events: Event[]) =>
  Object.fromEntries(
    images.map(({ id: imageId }) => [
      imageId,
      events.find(
        (thisEvent) =>
          `private/${thisEvent.secondary_entity?.id}` === imageId ||
          (`private/${thisEvent.entity?.id}` === imageId &&
            thisEvent.status === 'failed')
      ),
    ])
  );

interface DisabledLinodeOptions {
  linodes: Linode[] | undefined;
}

/**
 * Returns linodes that should be disabled on the Image Create flow.
 *
 * @returns key/value pairs for disabled linodes. the key is the linode id and the value is why the linode is disabled
 */
export const getDisabledLinodes = (
  options: DisabledLinodeOptions,
  grants: Grants | undefined
) => {
  const { linodes } = options;
  const readOnlyLinodeIds = getEntityIdsByPermission(
    grants,
    'linode',
    'read_only'
  );

  // Disable images that do not support distributed sites if the selected region is distributed
  if (linodes) {
    const disabledLinodes: Record<string, DisableItemOption> = {};

    for (const linode of linodes) {
      if (readOnlyLinodeIds.includes(linode.id)) {
        disabledLinodes[linode.id] = {
          reason: 'You can only select Linodes you have read/write access to.',
        };
      }
    }
    return disabledLinodes;
  }

  return {};
};
