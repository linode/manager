import { typeLabelLong } from 'src/features/Linodes/presentation';

export const getLinodeDescription = (
  typeLabel: string,
  memory: number,
  disk: number,
  vcpus: number,
  imageLabel: null | string
) => {
  const typeDesc = typeLabelLong(typeLabel, memory, disk, vcpus);

  // Check if we return an empty string for imageDesc if the slug is nonexistent
  if (!imageLabel) {
    return `${typeDesc}`;
  } else {
    return `${imageLabel}, ${typeDesc}`;
  }
};
