import type { LinodeCreateFormValues } from '../utilities';

interface BackupsEnabledOptions {
  accountBackupsEnabled: boolean | undefined;
  isDistributedRegion: boolean;
  value: LinodeCreateFormValues['backups_enabled'];
}

export const getBackupsEnabledValue = (options: BackupsEnabledOptions) => {
  if (options.isDistributedRegion) {
    return false;
  }

  if (options.accountBackupsEnabled) {
    return true;
  }

  if (options.value === undefined || options.value === null) {
    return false;
  }

  return options.value;
};
