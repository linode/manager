import { ObjectStorageBucket } from 'linode-js-sdk/lib/object-storage';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { formatObjectStorageCluster } from 'src/utilities/formatRegion';
import BucketActionMenu from './BucketActionMenu';

type ClassNames = 'bucketNameWrapper' | 'bucketRow' | 'link';

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
    }
  });

interface BucketTableRowProps extends ObjectStorageBucket {
  onRemove: () => void;
}

type CombinedProps = BucketTableRowProps & WithStyles<ClassNames>;

export const BucketTableRow: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, label, cluster, hostname, created, onRemove } = props;

  return (
    <TableRow
      key={label}
      rowLink={`/object-storage/buckets/${cluster}/${label}`}
      data-qa-bucket-cell={label}
      className={`${classes.bucketRow} ${'fade-in-table'}`}
    >
      <TableCell parentColumn="Name">
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="bucket" />
          </Grid>
          <Grid item>
            <div className={classes.bucketNameWrapper}>
              <Typography variant="h3" data-qa-label>
                {label}
              </Typography>
            </div>
            <a
              className={classes.link}
              href={`https://${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              data-qa-hostname
            >
              {hostname}
            </a>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Region">
        <Typography variant="body2" data-qa-region>
          {formatObjectStorageCluster(cluster)}
        </Typography>
      </TableCell>
      <TableCell parentColumn="Created">
        <DateTimeDisplay
          value={created}
          humanizeCutoff="month"
          data-qa-created
        />
      </TableCell>
      <TableCell>
        <BucketActionMenu onRemove={onRemove} data-qa-action-menu />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(BucketTableRow);
