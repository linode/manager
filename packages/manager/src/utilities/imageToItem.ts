import { Item } from 'src/components/EnhancedSelect/Select';

/**
 * Takes a list of images (string[]) and converts
 * them to Item[] for use in the EnhancedSelect component.
 *
 * Also trims 'linode/' off the name of public images.
 */
export const imageToItem = (images: string[]): Item[] => {
  return images.map((image) => ({
    label: image.replace('linode/', ''),
    value: image,
  }));
};
