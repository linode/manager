import { Event } from '@linode/api-v4';
import { Volume } from '@linode/api-v4';

export interface ExtendedVolume extends Volume {
  recentEvent?: Event;
  linodeLabel?: string;
  linodeStatus?: string;
  eligibleForUpgradeToNVMe?: boolean;
  nvmeUpgradeScheduledByUserImminent?: boolean;
  nvmeUpgradeScheduledByUserInProgress?: boolean;
}
