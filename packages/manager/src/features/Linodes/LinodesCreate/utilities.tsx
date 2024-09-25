import type { Region } from '@linode/api-v4/lib';

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
