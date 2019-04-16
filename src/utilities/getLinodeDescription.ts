import { typeLabelLong } from 'src/features/linodes/presentation';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';

export const linodeDescription = (
  typeLabel: string,
  memory: number,
  disk: number,
  vcpus: number,
  imageId: string | null,
  images: Linode.Image[]
) => {
  const imageDesc = safeGetImageLabel(images, imageId);
  const typeDesc = typeLabelLong(typeLabel, memory, disk, vcpus);

  // Check if we return an empty string for imageDesc if the slug is nonexsistent
  if (imageDesc === '') {
    return `${typeDesc}`;
  } else {
    return `${imageDesc}, ${typeDesc}`;
  }
};

export default linodeDescription;
