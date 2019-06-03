import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
// @todo: uncomment this Link import when a bucket landing page exists
// import { Link } from 'react-router-dom';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { formatRegion } from 'src/utilities/formatRegion';
import { readableBytes } from 'src/utilities/unitConversions';
import BucketActionMenu from './BucketActionMenu';

type ClassNames = 'root' | 'labelStatusWrapper' | 'bucketRow';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    bucketRow: {
      backgroundColor: theme.bg.white
    },
    labelStatusWrapper: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center'
    }
  });

interface BucketTableRowProps extends Linode.Bucket {
  onRemove: () => void;
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
    cluster,
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
            <EntityIcon variant="bucket" />
          </Grid>
          <Grid item>
            <div className={classes.labelStatusWrapper}>
              <Typography variant="h3" data-qa-label>
                {label}
              </Typography>
            </div>
            <Typography variant="body2" data-qa-hostname>
              {hostname}
            </Typography>
          </Grid>
        </Grid>
        {/* @todo: uncomment this <Link/> when a bucket landing page exists*/}
        {/* </Link> */}
      </TableCell>
      <TableCell parentColumn="Objects">
        <Grid>
          <Typography variant="body2" data-qa-num-objects>
            {`${objects} ${objects === 1 ? 'object' : 'objects'}`}
          </Typography>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Size">
        <Grid>
          <Typography variant="body1" data-qa-size>
            {readableBytes(size).formatted}
          </Typography>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Region">
        <Typography variant="body2" data-qa-region>
          {formatRegion(region)}
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
        <BucketActionMenu
          onRemove={onRemove}
          bucketLabel={label}
          cluster={cluster}
          data-qa-action-menu
        />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(BucketTableRow);
