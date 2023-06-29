import * as React from 'react';
import { Hidden } from 'src/components/Hidden';
import Paginate from 'src/components/Paginate';
import { BucketTableRow } from './BucketTableRow';
import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

interface Props {
  data: ObjectStorageBucket[];
  handleClickDetails: (bucket: ObjectStorageBucket) => void;
  handleClickRemove: (bucket: ObjectStorageBucket) => void;
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  order: 'asc' | 'desc';
  orderBy: string;
}

export const BucketTable = (props: Props) => {
  const {
    data,
    orderBy,
    order,
    handleOrderChange,
    handleClickRemove,
    handleClickDetails,
  } = props;

  return (
    <Paginate data={data} pageSize={25}>
      {({
        data: paginatedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => (
        <React.Fragment>
          <Table aria-label="List of your Buckets">
            <TableHead>
              <TableRow>
                <TableSortCell
                  active={orderBy === 'label'}
                  label="label"
                  direction={order}
                  handleClick={handleOrderChange}
                  data-qa-name
                >
                  Name
                </TableSortCell>
                <Hidden smDown>
                  <TableSortCell
                    active={orderBy === 'cluster'}
                    label="cluster"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-region
                  >
                    Region
                  </TableSortCell>
                </Hidden>
                <Hidden lgDown>
                  <TableSortCell
                    active={orderBy === 'created'}
                    label="created"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-created
                  >
                    Created
                  </TableSortCell>
                </Hidden>
                <TableSortCell
                  active={orderBy === 'size'}
                  label="size"
                  direction={order}
                  handleClick={handleOrderChange}
                  data-qa-size
                >
                  Size
                </TableSortCell>
                <Hidden smDown>
                  <TableSortCell
                    active={orderBy === 'objects'}
                    label="objects"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-objects
                  >
                    Objects
                  </TableSortCell>
                </Hidden>

                {/* Empty TableCell for ActionMenu*/}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              <RenderData
                data={paginatedData}
                onRemove={handleClickRemove}
                onDetails={handleClickDetails}
              />
            </TableBody>
          </Table>

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
  onDetails: (bucket: ObjectStorageBucket) => void;
}

const RenderData: React.FC<RenderDataProps> = (props) => {
  const { data, onRemove, onDetails } = props;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {data.map((bucket) => (
        <BucketTableRow
          {...bucket}
          key={`${bucket.label}-${bucket.cluster}`}
          onRemove={() => onRemove(bucket)}
          onDetails={() => onDetails(bucket)}
        />
      ))}
    </>
  );
};
