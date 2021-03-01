import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import { displayType } from 'src/features/linodes/presentation';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { ExtendedLinode } from './types';
import Typography from 'src/components/core/Typography';
import * as React from 'react';

/**
 * adds a heading and subheading key to the Linode
 */
export const extendLinodes = (
  linodes: Linode[],
  imagesData: Record<string, Image> = {},
  typesData: ExtendedType[] = []
): ExtendedLinode[] => {
  return linodes.map((linode) => {
    /** get image data based on the Linode's image key */
    const linodeImageMetaData = imagesData[linode.image || ''];

    return {
      ...linode,
      heading: linode.label,
      subHeadings: formatLinodeSubheading(
        displayType(linode.type, typesData),
        linodeImageMetaData ? linodeImageMetaData.label : ''
      ),
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
  const thisLinode = linodes.find((linode) => linode.id === id);
  return thisLinode ? thisLinode.region : undefined;
};

export const gpuPlanText = (useTypography?: boolean): JSX.Element => {
  const gpuPlanTextSegments = [
    'Linode GPU plans have limited availability and may not be available at the time of your request. Some additional verification may be required to access these services. ',
    'with information on getting started.',
  ];

  if (useTypography) {
    return (
      <Typography>
        {gpuPlanTextSegments[0]}
        <a
          href="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/"
          target="_blank"
          aria-describedby="external-site"
          rel="noopener noreferrer"
        >
          Here is a guide
        </a>{' '}
        {gpuPlanTextSegments[1]}
      </Typography>
    );
  }

  return (
    <>
      {gpuPlanTextSegments[0]}
      <a
        href="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/"
        target="_blank"
        aria-describedby="external-site"
        rel="noopener noreferrer"
      >
        {` `}Here is a guide
      </a>{' '}
      {gpuPlanTextSegments[1]}
    </>
  );
};
