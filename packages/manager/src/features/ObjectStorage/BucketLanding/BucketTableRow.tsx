import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { useObjectStorageClusters } from 'src/queries/objectStorage';
import { useRegionsQuery } from 'src/queries/regions';
import { readableBytes } from 'src/utilities/unitConversions';
import BucketActionMenu from './BucketActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  bucketRow: {
    backgroundColor: theme.bg.white,
  },
  bucketNameWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    wordBreak: 'break-all',
  },
  link: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  bucketLabel: {
    color: theme.textColors.linkActiveLight,
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  bucketRegion: {
    width: '20%',
  },
  bucketSize: {
    width: '15%',
  },
  bucketObjects: {
    width: '10%',
  },
}));

interface BucketTableRowProps extends ObjectStorageBucket {
  onRemove: () => void;
  onDetails: () => void;
}

export type CombinedProps = BucketTableRowProps;

export const BucketTableRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
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
    <TableRow
      key={label}
      data-qa-bucket-cell={label}
      className={classes.bucketRow}
      ariaLabel={label}
    >
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center" spacing={2}>
          <Grid>
            <div className={classes.bucketNameWrapper}>
              <Typography variant="body1" component="h3" data-qa-label>
                <Link
                  className={classes.bucketLabel}
                  to={`/object-storage/buckets/${cluster}/${label}`}
                >
                  {label}{' '}
                </Link>
              </Typography>
            </div>

            {hostname}
          </Grid>
        </Grid>
      </TableCell>
      <Hidden smDown>
        <TableCell className={classes.bucketRegion}>
          <Typography variant="body1" data-qa-region>
            {region?.label ?? cluster}
          </Typography>
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          <DateTimeDisplay value={created} data-qa-created />
        </TableCell>
      </Hidden>
      <TableCell className={classes.bucketSize} noWrap>
        <Typography variant="body1" data-qa-size>
          {readableBytes(size).formatted}
        </Typography>
      </TableCell>

      <Hidden smDown>
        <TableCell className={classes.bucketObjects}>
          <Typography variant="body1" data-qa-size>
            {objects}
          </Typography>
        </TableCell>
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
    </TableRow>
  );
};

export default BucketTableRow;
