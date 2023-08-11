import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { displayType } from 'src/features/Linodes/presentation';
import { ExtendedType } from 'src/utilities/extendType';

import { ExtendedLinode } from './types';

/**
 * adds a heading and subheading key to the Linode
 */
export const extendLinodes = (
  linodes: Linode[],
  imagesData: Record<string, Image> = {},
  typesData: ExtendedType[] = [],
  regionsData: Region[] = []
): ExtendedLinode[] => {
  return linodes.map((linode) => {
    /** get image data based on the Linode's image key */
    const linodeImageMetaData = imagesData[linode.image || ''];

    return {
      ...linode,
      heading: linode.label,
      subHeadings: formatLinodeSubheading(
        displayType(linode.type, typesData),
        linodeImageMetaData ? linodeImageMetaData.label : '',
        regionsData.find((region) => region.id === linode.region)?.label ??
          undefined
      ),
    };
  });
};

export const formatLinodeSubheading = (
  typeLabel: string,
  imageLabel?: string,
  regionLabel?: string
) => {
  if (imageLabel && regionLabel) {
    return [`${typeLabel}, ${imageLabel}, ${regionLabel}`];
  }
  if (imageLabel) {
    return [`${typeLabel}, ${imageLabel}`];
  }
  return [typeLabel];
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
        <Link to="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/">
          Here is a guide
        </Link>{' '}
        {gpuPlanTextSegments[1]}
      </Typography>
    );
  }

  return (
    <>
      {gpuPlanTextSegments[0]}
      <Link to="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/">
        {` `}Here is a guide
      </Link>{' '}
      {gpuPlanTextSegments[1]}
    </>
  );
};

export const getMonthlyAndHourlyNodePricing = (
  monthlyPrice: number,
  hourlyPrice: number,
  numberOfNodes: number
) => {
  return {
    hourlyPrice: Math.round(hourlyPrice * numberOfNodes * 1000) / 1000,
    monthlyPrice: monthlyPrice * numberOfNodes,
  };
};

export const CROSS_DATA_CENTER_CLONE_WARNING =
  'Cloning a Powered Off instance across Data Centers may cause long periods of down time.';

/**
 * Unicode to ASCII (encode data to Base64)
 * https://base64.guru/developers/javascript/examples/unicode-strings
 */
export const utoa = (data: string) => {
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch (error) {
    return data;
  }
};
