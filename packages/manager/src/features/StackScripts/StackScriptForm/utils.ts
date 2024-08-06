import type { SelectImageOption } from 'src/features/Images/ImageSelect';

/**
 * Takes a list of images (string[]) and converts
 * them to SelectImageOption[] for use in the ImageSelect component.
 *
 * Also trims 'linode/' off the name of public images.
 */
export const imageToImageOptions = (images: string[]): SelectImageOption[] => {
  return images.map((image) => ({
    label: image.replace('linode/', ''),
    value: image,
  }));
};
