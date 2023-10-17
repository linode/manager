import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import type { APIError, Disk, LinodeType } from '@linode/api-v4';

export const getError = (error: APIError[] | null) => {
  if (!error) {
    return null;
  }

  const errorText = error?.[0]?.reason;
  if (
    typeof errorText === 'string' &&
    errorText.match(/allocated more disk/i)
  ) {
    return (
      <Typography>
        The current disk size of your Linode is too large for the new service
        plan. Please resize your disk to accommodate the new plan. You can read
        our{' '}
        <Link to="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/">
          Resize Your Linode
        </Link>{' '}
        guide for more detailed instructions.
      </Typography>
    );
  }

  return errorText;
};

/**
 * the user should only be given the option to automatically resize
 * their disks under the 2 following conditions:
 *
 * 1. They have 1 ext disk (and nothing else)
 * 2. They have 1 ext disk and 1 swap disk (and nothing else)
 *
 * If they have more than 2 disks, no automatic resizing is going to
 * take place server-side, so given them the option to toggle
 * the checkbox is pointless.
 *
 * @returns array of both the ext disk to resize and a boolean
 * of whether the option should be enabled
 */
export const shouldEnableAutoResizeDiskOption = (
  linodeDisks: Disk[]
): [string | undefined, boolean] => {
  const linodeExtDiskLabels = linodeDisks.reduce((acc, eachDisk) => {
    return eachDisk.filesystem === 'ext3' || eachDisk.filesystem === 'ext4'
      ? [...acc, eachDisk.label]
      : acc;
  }, []);
  const linodeHasOneExtDisk = linodeExtDiskLabels.length === 1;
  const linodeHasOneSwapDisk =
    linodeDisks.reduce((acc, eachDisk) => {
      return eachDisk.filesystem === 'swap'
        ? [...acc, eachDisk.filesystem]
        : acc;
    }, []).length === 1;
  const shouldEnable =
    (linodeDisks.length === 1 && linodeHasOneExtDisk) ||
    (linodeDisks.length === 2 && linodeHasOneSwapDisk && linodeHasOneExtDisk);
  return [linodeExtDiskLabels[0], shouldEnable];
};

export const isSmallerThanCurrentPlan = (
  selectedPlanID: null | string,
  currentPlanID: null | string,
  types: LinodeType[]
) => {
  const currentType = types.find((thisType) => thisType.id === currentPlanID);
  const nextType = types.find((thisType) => thisType.id === selectedPlanID);

  if (!(currentType && nextType)) {
    return false;
  }

  return currentType.disk > nextType.disk;
};
