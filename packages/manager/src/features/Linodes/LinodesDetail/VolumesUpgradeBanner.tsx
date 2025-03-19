import { useLinodeVolumesQuery, useNotificationsQuery } from '@linode/queries';
import { Button, Notice, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { getUpgradeableVolumeIds } from 'src/features/Volumes/utils';

interface Props {
  linodeId: number;
}

export const VolumesUpgradeBanner = ({ linodeId }: Props) => {
  const history = useHistory();

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
    <Paper sx={{ padding: 0 }}>
      <Notice spacingBottom={0} variant="info">
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          py={1}
        >
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
          <Button
            onClick={() =>
              history.push(`/linodes/${linodeId}/storage?upgrade=true`)
            }
            buttonType="primary"
          >
            Upgrade {numUpgradeableVolumes > 1 ? 'Volumes' : 'Volume'}
          </Button>
        </Stack>
      </Notice>
    </Paper>
  );
};
