interface BackupsEnabledOptions {
  accountBackupsEnabled: boolean | undefined;
  isDistributedRegion: boolean;
  value: boolean | undefined;
}

export const getBackupsEnabledValue = (options: BackupsEnabledOptions) => {
  if (options.isDistributedRegion) {
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
