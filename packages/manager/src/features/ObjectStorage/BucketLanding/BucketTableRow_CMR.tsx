import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { formatObjectStorageCluster } from 'src/utilities/formatRegion';
import { readableBytes } from 'src/utilities/unitConversions';
import BucketActionMenu from './BucketActionMenu_CMR';
import Hidden from 'src/components/core/Hidden';
import { Link } from 'react-router-dom';

type ClassNames = 'bucketNameWrapper' | 'bucketRow' | 'link' | 'bucketLabel';

const styles = (theme: Theme) =>
  createStyles({
    bucketRow: {
      backgroundColor: theme.bg.white
    },
    bucketNameWrapper: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',
      wordBreak: 'break-all'
    },
    link: {
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    bucketLabel: {
      color: theme.cmrTextColors.linkActiveLight
    }
  });

interface BucketTableRowProps extends ObjectStorageBucket {
  onRemove: () => void;
  onDetails: () => void;
}

type CombinedProps = BucketTableRowProps & WithStyles<ClassNames>;

export const BucketTableRow: React.FC<CombinedProps> = props => {
  const {
    classes,
    label,
    cluster,
    hostname,
    created,
    size,
    onRemove,
    objects,
    onDetails
  } = props;

  return (
    <TableRow
      key={label}
      data-qa-bucket-cell={label}
      className={`${classes.bucketRow} ${'fade-in-table'}`}
      ariaLabel={label}
    >
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <div className={classes.bucketNameWrapper}>
              <Typography variant="body2" component="h3" data-qa-label>
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
      <Hidden xsDown>
        <TableCell>
          <Typography variant="body2" data-qa-region>
            {formatObjectStorageCluster(cluster) || cluster}
          </Typography>
        </TableCell>
      </Hidden>

      <Hidden smDown>
        <TableCell>
          <DateTimeDisplay value={created} data-qa-created />
        </TableCell>
      </Hidden>

      <TableCell>
        <Typography variant="body2" data-qa-size>
          {readableBytes(size).formatted}
        </Typography>
      </TableCell>

      <Hidden smDown>
        <TableCell>
          <Typography variant="body2" data-qa-size>
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

const styled = withStyles(styles);

export default styled(BucketTableRow);
