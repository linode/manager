import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
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
import { DeleteBucketRequest } from 'src/store/bucket/bucket.requests';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import BucketTableRow from './BucketTableRow';

type ClassNames = 'root' | 'label';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  label: {
    paddingLeft: 65
  }
});

interface Props {
  data: Linode.Bucket[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames> & BucketsRequests;

type BucketToRemove = DeleteBucketRequest;

export const ListBuckets: React.StatelessComponent<CombinedProps> = props => {
  const { data, orderBy, order, handleOrderChange, classes } = props;

  const removeBucketConfirmationDialog = useOpenClose();
  const [
    bucketToRemove,
    setBucketToRemove
  ] = React.useState<BucketToRemove | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [confirmBucketName, setConfirmBucketName] = React.useState<string>('');

  const handleClickRemove = (cluster: string, label: string) => {
    setBucketToRemove({ cluster, label });
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
    deleteBucket({ cluster, label })
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
            handlePageChange={handlePageChange()}
            handleSizeChange={handlePageSizeChange}
            eventCategory="object storage landing"
          />
          <ConfirmationDialog
            open={removeBucketConfirmationDialog.isOpen}
            onClose={() => {
              setBucketToRemove(null);
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
            <Typography>
              Are you sure you want to delete this bucket? This action{' '}
              <strong>cannot</strong> be undone, and will result in permanent
              data loss.
            </Typography>
            <TextField
              label="Type the name of the bucket to confirm."
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
  onRemove: (cluster: string, bucketLabel: string) => void;
}

const RenderData: React.StatelessComponent<RenderDataProps> = props => {
  const { data, onRemove } = props;

  return (
    <>
      {data.map(bucket => (
        <BucketTableRow {...bucket} key={bucket.label} onRemove={onRemove} />
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
