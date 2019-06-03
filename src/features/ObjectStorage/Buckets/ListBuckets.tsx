import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import TextField from 'src/components/TextField';
import bucketRequestsContainer, {
  BucketsRequests
} from 'src/containers/bucketRequests.container';
import useOpenClose from 'src/hooks/useOpenClose';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { readableBytes } from 'src/utilities/unitConversions';
import BucketTableRow from './BucketTableRow';

type ClassNames = 'root' | 'label' | 'confirmationCopy';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    label: {
      paddingLeft: 65
    },
    confirmationCopy: {
      marginTop: theme.spacing(1)
    }
  });

interface Props {
  data: Linode.Bucket[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames> & BucketsRequests;

export const ListBuckets: React.StatelessComponent<CombinedProps> = props => {
  const { data, orderBy, order, handleOrderChange, classes } = props;

  const removeBucketConfirmationDialog = useOpenClose();
  const [bucketToRemove, setBucketToRemove] = React.useState<
    Linode.Bucket | undefined
  >(undefined);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [confirmBucketName, setConfirmBucketName] = React.useState<string>('');

  const handleClickRemove = (bucket: Linode.Bucket) => {
    setBucketToRemove(bucket);
    setError('');
    removeBucketConfirmationDialog.open();
  };

  const removeBucket = () => {
    const { deleteBucket } = props;

    // This shouldn't happen, but just in case (and to get TS to quit complaining...)
    if (!bucketToRemove) {
      return;
    }

    setError('');
    setIsLoading(true);

    const { cluster, label } = bucketToRemove;
    // Passing in `force: 1` as a param to delete ALL items within
    // the bucket before deleting the bucket itself.
    deleteBucket({ cluster, label, params: { force: 1 } })
      .then(() => {
        removeBucketConfirmationDialog.close();
        setIsLoading(false);
      })
      .catch(e => {
        setIsLoading(false);
        const errorText = getErrorStringOrDefault(e, 'Error removing bucket.');
        setError(errorText);
      });
  };

  const actions = () => (
    <ActionsPanel>
      <Button
        type="cancel"
        onClick={() => {
          removeBucketConfirmationDialog.close();
        }}
        data-qa-cancel
      >
        Cancel
      </Button>
      <Button
        type="secondary"
        destructive
        onClick={removeBucket}
        data-qa-submit-rebuild
        loading={isLoading}
        disabled={
          bucketToRemove ? confirmBucketName !== bucketToRemove.label : true
        }
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  const deleteBucketConfirmationMessage = bucketToRemove ? (
    <React.Fragment>
      {bucketToRemove.size > 0 ? (
        <Typography>
          This bucket contains{' '}
          <strong>
            {bucketToRemove.objects}{' '}
            {bucketToRemove.objects === 1 ? 'object' : 'objects'}
          </strong>{' '}
          totalling{' '}
          <strong>{readableBytes(bucketToRemove.size).formatted}</strong> that
          will be deleted along with the bucket. Deleting a bucket is permanent
          and can't be undone.
        </Typography>
      ) : (
        <Typography>
          Deleting a bucket is permanent and can't be undone.
        </Typography>
      )}
      <Typography className={classes.confirmationCopy}>
        To confirm deletion, type the name of the bucket ({bucketToRemove.label}
        ) in the field below:
      </Typography>
    </React.Fragment>
  ) : null;

  return (
    <Paginate data={data} pageSize={25}>
      {({
        data: paginatedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize
      }) => (
        <React.Fragment>
          <Paper>
            <Table removeLabelonMobile aria-label="List of your Buckets">
              <TableHead>
                <TableRow>
                  <TableSortCell
                    active={orderBy === 'label'}
                    label="label"
                    direction={order}
                    handleClick={handleOrderChange}
                    className={classes.label}
                    data-qa-name
                  >
                    Name
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'objects'}
                    label="objects"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-objects
                  >
                    Objects
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'size'}
                    label="size"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-size
                  >
                    Size
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'region'}
                    label="region"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-region
                  >
                    Region
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'created'}
                    label="created"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-created
                  >
                    Created
                  </TableSortCell>
                  {/* Empty TableCell for ActionMenu*/}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <RenderData data={paginatedData} onRemove={handleClickRemove} />
              </TableBody>
            </Table>
          </Paper>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
            eventCategory="object storage landing"
          />
          <ConfirmationDialog
            open={removeBucketConfirmationDialog.isOpen}
            onClose={() => {
              removeBucketConfirmationDialog.close();
            }}
            title={
              bucketToRemove
                ? `Delete ${bucketToRemove.label}`
                : 'Delete bucket'
            }
            actions={actions}
            error={error}
          >
            {deleteBucketConfirmationMessage}
            <TextField
              onChange={e => setConfirmBucketName(e.target.value)}
              expand
            />
          </ConfirmationDialog>
        </React.Fragment>
      )}
    </Paginate>
  );
};

interface RenderDataProps {
  data: Linode.Bucket[];
  onRemove: (bucket: Linode.Bucket) => void;
}

const RenderData: React.StatelessComponent<RenderDataProps> = props => {
  const { data, onRemove } = props;

  return (
    <>
      {data.map(bucket => (
        <BucketTableRow
          {...bucket}
          key={bucket.label}
          onRemove={() => onRemove(bucket)}
        />
      ))}
    </>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  bucketRequestsContainer
);

export default enhanced(ListBuckets);
