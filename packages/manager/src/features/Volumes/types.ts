import { Event } from '@linode/api-v4/lib/account/types';
import { Volume } from '@linode/api-v4/lib/volumes/types';

export interface ExtendedVolume extends Volume {
  recentEvent?: Event;
  linodeLabel?: string;
  linodeStatus?: string;
  eligibleForUpgradeToNVMe?: boolean;
  nvmeUpgradeScheduledByUserImminent?: boolean;
  nvmeUpgradeScheduledByUserInProgress?: boolean;
}
