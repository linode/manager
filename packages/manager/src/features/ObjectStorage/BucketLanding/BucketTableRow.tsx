import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { Typography } from 'src/components/Typography';
import { useObjectStorageClusters } from 'src/queries/objectStorage';
import { useRegionsQuery } from 'src/queries/regions';
import { readableBytes } from 'src/utilities/unitConversions';

import { BucketActionMenu } from './BucketActionMenu';
import {
  StyledBucketLabelLink,
  StyledBucketNameWrapper,
  StyledBucketObjectsCell,
  StyledBucketRegionCell,
  StyledBucketRow,
  StyledBucketSizeCell,
} from './BucketTableRow.styles';

export interface BucketTableRowProps extends ObjectStorageBucket {
  onDetails: () => void;
  onRemove: () => void;
}

export const BucketTableRow = (props: BucketTableRowProps) => {
  const {
    cluster,
    created,
    hostname,
    label,
    objects,
    onDetails,
    onRemove,
    size,
  } = props;

  const { data: clusters } = useObjectStorageClusters();
  const { data: regions } = useRegionsQuery();

  const actualCluster = clusters?.find((c) => c.id === cluster);
  const region = regions?.find((r) => r.id === actualCluster?.region);

  return (
    <StyledBucketRow ariaLabel={label} data-qa-bucket-cell={label} key={label}>
      <TableCell>
        <Grid alignItems="center" container spacing={2} wrap="nowrap">
          <Grid>
            <StyledBucketNameWrapper>
              <Typography component="h3" data-qa-label variant="body1">
                <StyledBucketLabelLink
                  to={`/object-storage/buckets/${cluster}/${label}`}
                >
                  {label}{' '}
                </StyledBucketLabelLink>
              </Typography>
            </StyledBucketNameWrapper>

            {hostname}
          </Grid>
        </Grid>
      </TableCell>
      <Hidden smDown>
        <StyledBucketRegionCell>
          <Typography data-qa-region variant="body1">
            {region?.label ?? cluster}
          </Typography>
        </StyledBucketRegionCell>
      </Hidden>
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

      <TableCell>
        <BucketActionMenu
          cluster={cluster}
          data-qa-action-menu
          label={label}
          onDetails={onDetails}
          onRemove={onRemove}
        />
      </TableCell>
    </StyledBucketRow>
  );
};
