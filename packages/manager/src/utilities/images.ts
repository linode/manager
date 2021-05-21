import { Image } from '@linode/api-v4/lib/images';
import { parseAPIDate } from 'src/utilities/date';
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
  startsWith,
} from 'ramda';

export const sortCreatedDESC = compose<any, any, any>(
  reverse,
  sortBy(
    compose(
      (created: string) => parseAPIDate(created).toFormat('x'),
      prop('created')
    )
  )
);

export const getMyImages = compose<any, any, any>(
  sortCreatedDESC,
  filter(propSatisfies(startsWith('private'), 'id'))
);

const isRecentlyDeleted = (i: Image) =>
  i.created_by === null && i.type === 'automatic';
const isByLinode = (i: Image) =>
  i.created_by !== null && i.created_by === 'linode';
const isDeprecated = (i: Image) => i.deprecated === true;
const isRecommended = (i: Image) => isByLinode(i) && !isDeprecated(i);
const isOlderImage = (i: Image) => isByLinode(i) && isDeprecated(i);

interface GroupedImages {
  deleted?: Image[];
  recommended?: Image[];
  older?: Image[];
  images?: Image[];
}

export let groupImages: (i: Image[]) => GroupedImages;
// eslint-disable-next-line
groupImages = groupBy(
  cond([
    [isRecentlyDeleted, always('deleted')],
    [isRecommended, always('recommended')],
    [isOlderImage, always('older')],
    [(_) => true, always('images')],
  ])
);

export const groupNameMap = {
  _default: 'Other',
  deleted: 'Recently Deleted Disks',
  recommended: '64-bit Distributions - Recommended',
  older: 'Older Distributions',
  images: 'Images',
};

export const getDisplayNameForGroup = (key: string) =>
  propOr('Other', key, groupNameMap);
