import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import Typography from 'src/components/core/Typography';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
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
  onRemove: () => void;
  onDetails: () => void;
}

export const BucketTableRow = (props: BucketTableRowProps) => {
  const {
    label,
    cluster,
    hostname,
    created,
    size,
    onRemove,
    objects,
    onDetails,
  } = props;

  const { data: clusters } = useObjectStorageClusters();
  const { data: regions } = useRegionsQuery();

  const actualCluster = clusters?.find((c) => c.id === cluster);
  const region = regions?.find((r) => r.id === actualCluster?.region);

  return (
    <StyledBucketRow key={label} data-qa-bucket-cell={label} ariaLabel={label}>
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center" spacing={2}>
          <Grid>
            <StyledBucketNameWrapper>
              <Typography variant="body1" component="h3" data-qa-label>
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
          <Typography variant="body1" data-qa-region>
            {region?.label ?? cluster}
          </Typography>
        </StyledBucketRegionCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          <DateTimeDisplay value={created} data-qa-created />
        </TableCell>
      </Hidden>
      <StyledBucketSizeCell noWrap>
        <Typography variant="body1" data-qa-size>
          {readableBytes(size).formatted}
        </Typography>
      </StyledBucketSizeCell>

      <Hidden smDown>
        <StyledBucketObjectsCell>
          <Typography variant="body1" data-qa-size>
            {objects}
          </Typography>
        </StyledBucketObjectsCell>
      </Hidden>

      <TableCell>
        <BucketActionMenu
          onRemove={onRemove}
          onDetails={onDetails}
          label={label}
          cluster={cluster}
          data-qa-action-menu
        />
      </TableCell>
    </StyledBucketRow>
  );
};
