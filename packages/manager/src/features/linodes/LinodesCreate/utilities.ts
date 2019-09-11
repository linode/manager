import { Image } from 'linode-js-sdk/lib/images';
import { Linode } from 'linode-js-sdk/lib/linodes'
import { displayType } from 'src/features/linodes/presentation';
import { ExtendedType } from './SelectPlanPanel';
import { ExtendedLinode } from './types';

/**
 * adds a heading and subheading key to the Linode
 */
export const extendLinodes = (
  linodes: Linode[],
  imagesData: Image[] = [],
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
  imageLabel?: string
) => {
  const subheading = imageLabel
    ? `${typeLabel}, ${imageLabel}`
    : `${typeLabel}`;
  return [subheading];
};

export const getRegionIDFromLinodeID = (
  linodes: Linode[],
  id: number
): string | undefined => {
  const thisLinode = linodes.find(linode => linode.id === id);
  return thisLinode ? thisLinode.region : undefined;
};
