import { Volume } from 'linode-js-sdk/lib/volumes';

export interface ExtendedVolume extends Volume {
  linodeLabel?: string;
  linodeStatus?: string;
}
