import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';
import BucketTableRow from './BucketTableRow';

type ClassNames = 'root' | 'label' | 'confirmationCopy';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    label: {
      paddingLeft: 65
    }
  });

interface Props {
  data: ObjectStorageBucket[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  handleClickRemove: (bucket: ObjectStorageBucket) => void;
  handleClickDetails: (bucket: ObjectStorageBucket) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const BucketTable: React.FC<CombinedProps> = props => {
  const {
    data,
    orderBy,
    order,
    handleOrderChange,
    handleClickRemove,
    handleClickDetails,
    classes
  } = props;

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
            <Table
              removeLabelonMobile
              aria-label="List of your Buckets"
              rowCount={data.length}
              colCount={3}
            >
              <TableHead>
                <TableRow role="rowgroup">
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
                    active={orderBy === 'cluster'}
                    label="cluster"
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
                  <TableSortCell
                    active={orderBy === 'size'}
                    label="size"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-size
                  >
                    Size
                  </TableSortCell>
                  {/* Empty TableCell for ActionMenu*/}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <RenderData
                  data={paginatedData}
                  onRemove={handleClickRemove}
                  onClickDetails={handleClickDetails}
                />
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
        </React.Fragment>
      )}
    </Paginate>
  );
};

interface RenderDataProps {
  data: ObjectStorageBucket[];
  onRemove: (bucket: ObjectStorageBucket) => void;
  onClickDetails: (bucket: ObjectStorageBucket) => void;
}

const RenderData: React.FC<RenderDataProps> = props => {
  const { data, onRemove, onClickDetails } = props;

  return (
    <>
      {data.map(bucket => (
        <BucketTableRow
          {...bucket}
          key={`${bucket.label}-${bucket.cluster}`}
          onRemove={() => onRemove(bucket)}
          onClickDetails={() => onClickDetails(bucket)}
        />
      ))}
    </>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled);

export default enhanced(BucketTable);
