import * as prettyBytes from 'pretty-bytes';
import * as React from 'react';
// @todo: uncomment this Link import when a bucket landing page exists
// import { Link } from 'react-router-dom';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { formatRegion } from 'src/utilities/formatRegion';
import BucketActionMenu from './BucketActionMenu';

type ClassNames = 'root' | 'labelStatusWrapper' | 'bucketRow' | 'hostname';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  bucketRow: {
    backgroundColor: theme.bg.white
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  hostname: { paddingTop: theme.spacing.unit }
});

// BucketTableRow has the same props as Linode.Bucket.
// Aliased for convention's sake.
interface BucketTableRowProps extends Linode.Bucket {
  onRemove: (cluster: string, bucketLabel: string) => void;
}

type CombinedProps = BucketTableRowProps & WithStyles<ClassNames>;

export const BucketTableRow: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    label,
    region,
    size,
    objects,
    hostname,
    created,
    onRemove
  } = props;

  return (
    <TableRow
      key={label}
      data-qa-bucket-cell={label}
      className={`${classes.bucketRow} ${'fade-in-table'}`}
    >
      <TableCell parentColumn="Name">
        {/* @todo: uncomment this <Link/> when a bucket landing page exists*/}
        {/* <Link to={`/buckets/${label}`}> */}
        <Grid container alignItems="center">
          <Grid item>
            {/* @todo: replace with bucket icon */}
            <EntityIcon variant="volume" />
          </Grid>
          <Grid item>
            <div className={classes.labelStatusWrapper}>
              <Typography variant="h3" data-qa-label>
                {label}
              </Typography>
            </div>
            <Typography
              variant="body2"
              className={classes.hostname}
              data-qa-hostname
            >
              {hostname}
            </Typography>
          </Grid>
        </Grid>
        {/* @todo: uncomment this <Link/> when a bucket landing page exists*/}
        {/* </Link> */}
      </TableCell>
      <TableCell parentColumn="Size">
        <Grid>
          <Typography variant="body1" data-qa-size>
            <strong>{prettyBytes(size)}</strong>
          </Typography>
        </Grid>
        <Grid>
          <Typography variant="body2" data-qa-num-objects>
            {objects} items
          </Typography>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Region">
        <Typography variant="body2" data-qa-region>
          {formatRegion(region)}
        </Typography>
      </TableCell>
      <TableCell parentColumn="created">
        <DateTimeDisplay
          value={created}
          humanizeCutoff="month"
          data-qa-created
        />
      </TableCell>
      <TableCell>
        <BucketActionMenu
          onRemove={onRemove}
          bucketLabel={label}
          cluster={region}
        />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(BucketTableRow);
