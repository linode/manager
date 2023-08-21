import { useGrants, useProfile } from 'src/queries/profile';

import type { Image, Linode } from '@linode/api-v4';

export const useImageAndLinodeGrantCheck = () => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const canCreateImage =
    Boolean(!profile?.restricted) || Boolean(grants?.global?.add_images);

  // Unrestricted users can create Images from any disk;
  // Restricted users need read_write on the Linode they're trying to Imagize
  // (in addition to the global add_images grant).
  const permissionedLinodes = profile?.restricted
    ? grants?.linode
        .filter((thisGrant) => thisGrant.permissions === 'read_write')
        .map((thisGrant) => thisGrant.id) ?? []
    : null;

  return { canCreateImage, permissionedLinodes };
};

export const getImageLabelForLinode = (linode: Linode, images: Image[]) => {
  const image = images?.find((image) => image.id === linode.image);
  return image?.label ?? linode.image;
};
