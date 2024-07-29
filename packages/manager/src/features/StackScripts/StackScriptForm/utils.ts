import type { SelectImageOptions } from 'src/features/Images/ImageSelect';

/**
 * Takes a list of images (string[]) and converts
 * them to SelectImageOptions[] for use in the ImageSelect component.
 *
 * Also trims 'linode/' off the name of public images.
 */
export const imageToImageOptions = (images: string[]): SelectImageOptions[] => {
  return images.map((image) => ({
    label: image.replace('linode/', ''),
    value: image,
  }));
};
