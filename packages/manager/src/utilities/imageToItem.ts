import { Item } from 'src/components/EnhancedSelect/Select';

/**
 * Takes a list of images (string[]) and converts
 * them to Item[] for use in the EnhancedSelect component.
 *
 * Also trims 'linode/' off the name of public images.
 */
export default (images: string[]): Item[] => {
  return images.map(image => {
    return {
      value: image,
      label: image.replace('linode/', '')
    };
  });
};
