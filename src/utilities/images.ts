import * as moment from 'moment';
import {
  always,
  compose,
  cond,
  filter,
  groupBy,
  prop,
  propOr,
  propSatisfies,
  reverse,
  sortBy,
  startsWith
} from 'ramda';

export const distroIcons = {
  Alpine: 'alpine',
  Arch: 'archlinux',
  CentOS: 'centos',
  CoreOS: 'coreos',
  Debian: 'debian',
  Fedora: 'fedora',
  Gentoo: 'gentoo',
  openSUSE: 'opensuse',
  Slackware: 'slackware',
  Ubuntu: 'ubuntu'
};

export const sortCreatedDESC = compose<any, any, any>(
  reverse,
  sortBy(
    compose(
      (created: string) => moment(created).format('x'),
      prop('created')
    )
  )
);

export const getMyImages = compose<any, any, any>(
  sortCreatedDESC,
  filter(propSatisfies(startsWith('private'), 'id'))
);

const isRecentlyDeleted = (i: Linode.Image) =>
  i.created_by === null && i.type === 'automatic';
const isByLinode = (i: Linode.Image) =>
  i.created_by !== null && i.created_by === 'linode';
const isDeprecated = (i: Linode.Image) => i.deprecated === true;
const isRecommended = (i: Linode.Image) => isByLinode(i) && !isDeprecated(i);
const isOlderImage = (i: Linode.Image) => isByLinode(i) && isDeprecated(i);

interface GroupedImages {
  deleted?: Linode.Image[];
  recommended?: Linode.Image[];
  older?: Linode.Image[];
  images?: Linode.Image[];
}

export let groupImages: (i: Linode.Image[]) => GroupedImages;
groupImages = groupBy(
  cond([
    [isRecentlyDeleted, always('deleted')],
    [isRecommended, always('recommended')],
    [isOlderImage, always('older')],
    [(i: Linode.Image) => true, always('images')]
  ])
);

export const groupNameMap = {
  _default: 'Other',
  deleted: 'Recently Deleted Disks',
  recommended: '64-bit Distributions - Recommended',
  older: 'Older Distributions',
  images: 'Images'
};

export const getDisplayNameForGroup = (key: string) =>
  propOr('Other', key, groupNameMap);

export const filterPublicImages = (images: Linode.Image[] = []) => {
  return images.filter((image: Linode.Image) => image.is_public);
};
