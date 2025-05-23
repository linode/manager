import { useRegionsQuery } from '@linode/queries';
import { Stack, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { getRegionsByRegionId, readableBytes } from '@linode/utilities';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useObjectStorageClusters } from 'src/queries/object-storage/queries';

import { useIsObjMultiClusterEnabled } from '../hooks/useIsObjectStorageGen2Enabled';
import { BucketActionMenu } from './BucketActionMenu';
import {
  StyledBucketObjectsCell,
  StyledBucketRegionCell,
  StyledBucketSizeCell,
} from './BucketTableRow.styles';

import type { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';

export interface BucketTableRowProps extends ObjectStorageBucket {
  onDetails: () => void;
  onRemove: () => void;
}

export const BucketTableRow = (props: BucketTableRowProps) => {
  const {
    cluster,
    created,
    endpoint_type,
    hostname,
    label,
    objects,
    onDetails,
    onRemove,
    region,
    size,
  } = props;

  const { data: regions } = useRegionsQuery();

  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  const { data: clusters } = useObjectStorageClusters(
    !isObjMultiClusterEnabled
  );

  const actualCluster = clusters?.find((c) => c.id === cluster);
  const clusterRegion = regions?.find((r) => r.id === actualCluster?.region);

  const regionsLookup = regions && getRegionsByRegionId(regions);

  const isLegacy = endpoint_type === 'E0';
  const typeLabel = isLegacy ? 'Legacy' : 'Standard';

  return (
    <TableRow data-qa-bucket-cell={label} key={label}>
      <TableCell>
        <MaskableText isToggleable text={hostname}>
          <Stack>
            <Link
              to={`/object-storage/buckets/${
                isObjMultiClusterEnabled ? region : cluster
              }/${label}`}
            >
              {label}
            </Link>
            {hostname}
          </Stack>
        </MaskableText>
      </TableCell>
      <Hidden smDown>
        <StyledBucketRegionCell>
          <Typography data-qa-region variant="body1">
            {isObjMultiClusterEnabled && regionsLookup && region
              ? regionsLookup[region].label
              : (clusterRegion?.label ?? cluster)}
          </Typography>
        </StyledBucketRegionCell>
      </Hidden>
      {Boolean(endpoint_type) && (
        <Hidden lgDown>
          <TableCell>
            <Typography data-qa-size variant="body1">
              {typeLabel} ({endpoint_type})
            </Typography>
          </TableCell>
        </Hidden>
      )}
      <Hidden lgDown>
        <TableCell>
          <DateTimeDisplay data-qa-created value={created} />
        </TableCell>
      </Hidden>
      <StyledBucketSizeCell noWrap>
        <Typography data-qa-size variant="body1">
          {readableBytes(size).formatted}
        </Typography>
      </StyledBucketSizeCell>

      <Hidden smDown>
        <StyledBucketObjectsCell>
          <Typography data-qa-size variant="body1">
            {objects}
          </Typography>
        </StyledBucketObjectsCell>
      </Hidden>

      <TableCell sx={{ paddingRight: 0 }}>
        <BucketActionMenu
          cluster={cluster}
          data-qa-action-menu
          label={label}
          onDetails={onDetails}
          onRemove={onRemove}
        />
      </TableCell>
    </TableRow>
  );
};
