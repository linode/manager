import { decode } from 'he';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { displayType } from 'src/features/Linodes/presentation';
import { ExtendedType } from 'src/utilities/extendType';

import { ExtendedLinode } from './types';

import type { Image, Linode, Region, StackScript } from '@linode/api-v4/lib';

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

export const regionSupportsMetadata = (
  regionsData: Region[],
  region: string
) => {
  return (
    regionsData
      .find((regionData) => regionData.id === region)
      ?.capabilities.includes('Metadata') ?? false
  );
};

/**
 * This function is used to remove the "One-Click" text from the label of an OCA StackScript.
 * @param stackScript
 * @returns StackScript
 */
export const trimOneClickFromLabel = (stackScript: StackScript) => {
  return {
    ...stackScript,
    label: stackScript.label.replace('One-Click', ''),
  };
};

interface FilteredOCAs {
  baseApps: Record<string, string>;
  newApps: Record<string, string> | never[];
  queryResults: StackScript[];
}

/**
 * This function is used to filter StackScripts OCAs.
 * @param baseApps // The base apps that are always displayed (static)
 * @param newApps // The new apps defined in the OneClickApps feature flag
 * @param queryResults // The results of the query for StackScripts
 * @returns an array of OCA StackScripts
 */
export const filterOneClickApps = ({
  baseApps,
  newApps,
  queryResults,
}: FilteredOCAs) => {
  const allowedApps = Object.keys({ ...baseApps, ...newApps });
  // Don't display One-Click Helpers to the user
  // Filter out any apps that we don't have info for
  const filteredApps: StackScript[] = queryResults.filter(
    (app: StackScript) => {
      return (
        !app.label.match(/helpers/i) && allowedApps.includes(String(app.id))
      );
    }
  );
  return filteredApps.map((app) => trimOneClickFromLabel(app));
};

/**
 * This function is used to
 * - decode the label of a StackScript
 * - remove the "Cluster" text from the label of a StackScript since it'll turn into a chip.
 * @param app // The StackScript
 * @returns the decoded label of the StackScript
 */
export const handleAppLabel = (app: StackScript) => {
  const decodedLabel = decode(app.label);
  const isCluster =
    decodedLabel.endsWith('Cluster ') &&
    app.user_defined_fields.some((field) => field.name === 'cluster_size');

  const label = isCluster ? decodedLabel.split(' Cluster')[0] : decodedLabel;

  return {
    decodedLabel,
    isCluster,
    label,
  };
};
