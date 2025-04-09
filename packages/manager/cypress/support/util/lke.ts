import { sortByVersion } from 'src/utilities/sort-by';

/**
 * Returns the string of the highest semantic version.
 */
export const getLatestKubernetesVersion = (versions: string[]) => {
  const sortedVersions = versions.sort((a, b) => {
    return sortByVersion(a, b, 'asc');
  });

  const latestVersion = sortedVersions.pop();

  if (!latestVersion) {
    // Return an empty string if sorting does not yield latest version
    return '';
  }
  return latestVersion;
};
