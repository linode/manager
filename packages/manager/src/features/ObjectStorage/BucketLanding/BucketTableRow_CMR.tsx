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

type ClassNames =
  | 'bucketNameWrapper'
  | 'bucketRow'
  | 'link'
  | 'bucketLabel'
  | 'actionCell';

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
      color: theme.cmrTextColors.linkActiveLight,
      fontFamily: theme.font.bold,
      '&:hover, &:focus': {
        textDecoration: 'underline'
      }
    },
    actionCell: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: 0,
      /*
      Explicitly stating this as the theme file is automatically adding padding to the last cell
      We can remove once we make the full switch to CMR styling
      */
      paddingRight: '0 !important'
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
          <DateTimeDisplay
            value={created}
            humanizeCutoff="month"
            data-qa-created
          />
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

      <TableCell className={classes.actionCell}>
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
