import { /* dcDisplayCountry, */ dcDisplayNames } from 'src/constants';

export const formatRegion = (region: string) => {
  const city = dcDisplayNames[region];

  return `${city || ''}`;

  /**
   * There doesn't seem to be a good way to format Country, City, Province/State inline.
   * We only have country for all international DCs. All of the following formats looks strange
   * even for the US:
   *
   * US Newark, NJ
   * Newark, NJ US
   * (US) Newark, NJ
   * Newark, NJ (US)
   * US - Newark, NJ
   * Newark, NJ - US
   *
   * JP Tokyo, JP
   * Tokyo, JP JP
   * (JP) Tokyo, JP
   * Tokyo, JP (JP)
   * JP - Tokyo, JP
   * Tokyo, JP - JP
   */
  // const country = dcDisplayCountry[region];
  // return `${country || ''} ${city || ''}`;
};
