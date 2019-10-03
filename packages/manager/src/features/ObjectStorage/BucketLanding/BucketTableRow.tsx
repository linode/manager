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
import { formatRegion } from 'src/utilities/formatRegion';
import BucketActionMenu from './BucketActionMenu';

type ClassNames = 'bucketNameWrapper' | 'bucketRow';

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
    }
  });

interface BucketTableRowProps extends Linode.Bucket {
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
            <Typography variant="body2" data-qa-hostname>
              {hostname}
            </Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Region">
        <Typography variant="body2" data-qa-region>
          {formatRegion(cluster)}
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
