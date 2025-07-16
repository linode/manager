import { useLinodeVolumesQuery, useNotificationsQuery } from '@linode/queries';
import { Button, Notice, Stack, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { Link } from 'src/components/Link';
import { getUpgradeableVolumeIds } from 'src/features/Volumes/utils';

interface Props {
  linodeId: number;
}

export const VolumesUpgradeBanner = ({ linodeId }: Props) => {
  const navigate = useNavigate();

  const { data: volumesData } = useLinodeVolumesQuery(linodeId);
  const { data: notifications } = useNotificationsQuery();

  const volumeIdsEligibleForUpgrade = getUpgradeableVolumeIds(
    volumesData?.data ?? [],
    notifications ?? []
  );

  const numUpgradeableVolumes = volumeIdsEligibleForUpgrade.length;

  if (numUpgradeableVolumes === 0) {
    return null;
  }

  return (
    <Notice forceImportantIconVerticalCenter variant="info">
      <Stack
        alignSelf="flex-start"
        direction="row"
        justifyContent="flex-end"
        spacing={1}
      >
        <Stack flex={1} justifyContent="center">
          <Typography>
            {numUpgradeableVolumes === 1
              ? 'A Volume attached to this Linode is '
              : 'Volumes attached to this Linode are '}
            eligible for a <b>free upgrade</b> to high performance NVMe Block
            Storage.{' '}
            <Link to="https://www.linode.com/blog/cloud-storage/nvme-block-storage-now-available/">
              Learn More
            </Link>
            .
          </Typography>
        </Stack>
        <Button
          buttonType="primary"
          onClick={() =>
            navigate({
              to: '/linodes/$linodeId/storage',
              params: { linodeId },
              search: { upgrade: true },
            })
          }
        >
          Upgrade {numUpgradeableVolumes > 1 ? 'Volumes' : 'Volume'}
        </Button>
      </Stack>
    </Notice>
  );
};
