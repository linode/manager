import { typeLabelLong } from 'src/features/linodes/presentation';

export const linodeDescription = (
  typeLabel: string,
  memory: number,
  disk: number,
  vcpus: number,
  imageId: string,
  images: Linode.Image[]
) => {
  const image = (images && images.find((img:Linode.Image) => img.id === imageId))
    || { label: 'Unknown Image' };
  const imageDesc = image.label;
  const typeDesc = typeLabelLong(typeLabel, memory, disk, vcpus);
  return `${imageDesc}, ${typeDesc}`;
}

export default linodeDescription;