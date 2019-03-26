import { displayType } from 'src/features/linodes/presentation';
import { ExtendedType } from './SelectPlanPanel';
import { ExtendedLinode } from './types';

/**
 * Literally just returning our original array of Linodes
 * with heading and subheading keys why is this function
 * so absurdly complicated?????
 */
export const extendLinodes = (
  linodes: Linode.Linode[],
  imagesData: Linode.Image[] = [],
  typesData: ExtendedType[] = []
): ExtendedLinode[] => {
  return linodes.map(linode => {
    /** get image data based on the Linode's image key */
    const linodeImageMetaData = imagesData.find(
      eachImage => eachImage.id === linode.image
    );

    return {
      ...linode,
      heading: linode.label,
      subHeadings: formatLinodeSubheading(
        displayType(linode.type, typesData),
        linodeImageMetaData ? linodeImageMetaData.label : ''
      )
    };
  });
};

export const formatLinodeSubheading = (
  typeLabel: string,
  imageLabel: string
) => {
  const subheading = imageLabel
    ? `${typeLabel}, ${imageLabel}`
    : `${typeLabel}`;
  return [subheading];
};
