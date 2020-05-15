import { Event } from 'linode-js-sdk/lib/account/types';
import { Volume } from 'linode-js-sdk/lib/volumes/types';

export interface ExtendedVolume extends Volume {
  recentEvent?: Event;
  linodeLabel?: string;
  linodeStatus?: string;
}
