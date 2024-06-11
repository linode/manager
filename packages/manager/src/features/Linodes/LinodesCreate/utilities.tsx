import { decode } from 'he';

import type { Region, StackScript } from '@linode/api-v4/lib';

export const getMonthlyAndHourlyNodePricing = (
  monthlyPrice: null | number | undefined,
  hourlyPrice: null | number | undefined,
  numberOfNodes: number
) => {
  return {
    hourlyPrice: hourlyPrice
      ? Math.round(hourlyPrice * numberOfNodes * 1000) / 1000
      : hourlyPrice,
    monthlyPrice: monthlyPrice ? monthlyPrice * numberOfNodes : monthlyPrice,
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
  baseAppIds: number[];
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
  baseAppIds,
  newApps,
  queryResults,
}: FilteredOCAs) => {
  const allowedAppIds = [...baseAppIds, ...Object.keys(newApps).map(Number)];

  // Don't display One-Click Helpers to the user
  // Filter out any apps that we don't have info for
  const filteredApps: StackScript[] = queryResults.filter(
    (app: StackScript) => {
      return !app.label.match(/helpers/i) && allowedAppIds.includes(app.id);
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
