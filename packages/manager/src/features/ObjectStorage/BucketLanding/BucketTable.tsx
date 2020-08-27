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
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import Table_CMR from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableSortCell from 'src/components/TableSortCell';
import TableSortCell_CMR from 'src/components/TableSortCell/TableSortCell_CMR';
import BucketTableRow from './BucketTableRow';
import BucketTableRow_CMR from './BucketTableRow_CMR';
import useFlags from 'src/hooks/useFlags';
import Hidden from 'src/components/core/Hidden';

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
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const BucketTable: React.FC<CombinedProps> = props => {
  const {
    data,
    orderBy,
    order,
    handleOrderChange,
    handleClickRemove,
    classes
  } = props;
  const flags = useFlags();

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
            {flags.cmr ? (
              <Table_CMR removeLabelonMobile aria-label="List of your Buckets">
                <TableHead>
                  <TableRow_CMR>
                    <TableSortCell_CMR
                      active={orderBy === 'label'}
                      label="label"
                      direction={order}
                      handleClick={handleOrderChange}
                      data-qa-name
                    >
                      Name
                    </TableSortCell_CMR>
                    <Hidden xsDown>
                      <TableSortCell_CMR
                        active={orderBy === 'cluster'}
                        label="cluster"
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-region
                      >
                        Region
                      </TableSortCell_CMR>
                    </Hidden>
                    <Hidden smDown>
                      <TableSortCell_CMR
                        active={orderBy === 'created'}
                        label="created"
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-created
                      >
                        Created
                      </TableSortCell_CMR>
                    </Hidden>
                    <TableSortCell_CMR
                      active={orderBy === 'size'}
                      label="size"
                      direction={order}
                      handleClick={handleOrderChange}
                      data-qa-size
                    >
                      Size
                    </TableSortCell_CMR>

                    {/* Empty TableCell for ActionMenu*/}
                    <TableCell_CMR />
                  </TableRow_CMR>
                </TableHead>
                <TableBody>
                  <RenderData
                    data={paginatedData}
                    onRemove={handleClickRemove}
                  />
                </TableBody>
              </Table_CMR>
            ) : (
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
                  />
                </TableBody>
              </Table>
            )}
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
}

const RenderData: React.FC<RenderDataProps> = props => {
  const { data, onRemove } = props;

  const flags = useFlags();

  return (
    <>
      {data.map(bucket =>
        flags.cmr ? (
          <BucketTableRow_CMR
            {...bucket}
            key={`${bucket.label}-${bucket.cluster}`}
            onRemove={() => onRemove(bucket)}
          />
        ) : (
          <BucketTableRow
            {...bucket}
            key={`${bucket.label}-${bucket.cluster}`}
            onRemove={() => onRemove(bucket)}
          />
        )
      )}
    </>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled);

export default enhanced(BucketTable);
