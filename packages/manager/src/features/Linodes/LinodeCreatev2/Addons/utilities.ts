interface BackupsEnabledOptions {
  accountBackupsEnabled: boolean | undefined;
  isEdgeRegion: boolean;
  value: boolean | undefined;
}

export const getBackupsEnabledValue = (options: BackupsEnabledOptions) => {
  if (options.isEdgeRegion) {
    return false;
  }

  if (options.accountBackupsEnabled) {
    return true;
  }

  if (options.value === undefined) {
    return false;
  }

  return options.value;
};
