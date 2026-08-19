import { Hidden } from '@linode/ui';
import * as React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';

import { BucketTableRow } from './BucketTableRow';

import type { ObjectStorageBucket } from '@linode/api-v4';

const BASE_COLUMN_COUNT = 7;

interface Props {
  data: ObjectStorageBucket[];
  handleClickDetails: (bucket: ObjectStorageBucket) => void;
  handleClickRemove: (bucket: ObjectStorageBucket) => void;
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  loading: boolean;
  order: 'asc' | 'desc';
  orderBy: string;
}

export const BucketTable = (props: Props) => {
  const {
    data,
    loading,
    handleClickDetails,
    handleClickRemove,
    handleOrderChange,
    order,
    orderBy,
  } = props;

  return (
    <Paginate data={data} pageSize={25}>
      {({
        count,
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => (
        <>
          <Table aria-label="List of your Buckets">
            <TableHead>
              <TableRow>
                <TableSortCell
                  active={orderBy === 'label'}
                  data-qa-name
                  direction={order}
                  handleClick={handleOrderChange}
                  label="label"
                >
                  Name
                </TableSortCell>
                <Hidden smDown>
                  <TableSortCell
                    active={orderBy === 'region'}
                    data-qa-region
                    direction={order}
                    handleClick={handleOrderChange}
                    label="region"
                  >
                    Region
                  </TableSortCell>
                </Hidden>
                <Hidden lgDown>
                  <TableSortCell
                    active={orderBy === 'endpoint_type'}
                    data-qa-created
                    direction={order}
                    handleClick={handleOrderChange}
                    label="endpoint_type"
                  >
                    Endpoint Type
                  </TableSortCell>
                </Hidden>
                <Hidden lgDown>
                  <TableSortCell
                    active={orderBy === 'created'}
                    data-qa-created
                    direction={order}
                    handleClick={handleOrderChange}
                    label="created"
                  >
                    Created
                  </TableSortCell>
                </Hidden>
                <TableSortCell
                  active={orderBy === 'size'}
                  data-qa-size
                  direction={order}
                  handleClick={handleOrderChange}
                  label="size"
                >
                  Size
                </TableSortCell>
                <Hidden smDown>
                  <TableSortCell
                    active={orderBy === 'objects'}
                    data-qa-objects
                    direction={order}
                    handleClick={handleOrderChange}
                    label="objects"
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
                loading={loading}
                onDetails={handleClickDetails}
                onRemove={handleClickRemove}
              />
            </TableBody>
          </Table>

          <PaginationFooter
            count={count}
            eventCategory="object storage landing"
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
            page={page}
            pageSize={pageSize}
          />
        </>
      )}
    </Paginate>
  );
};

interface RenderDataProps {
  data: ObjectStorageBucket[];
  loading: boolean;
  onDetails: (bucket: ObjectStorageBucket) => void;
  onRemove: (bucket: ObjectStorageBucket) => void;
}

const RenderData: React.FC<RenderDataProps> = (props) => {
  const { data, loading, onDetails, onRemove } = props;

  if (loading) {
    return (
      <TableRowLoading
        columns={BASE_COLUMN_COUNT}
        rows={data.length > 0 ? data.length : 1}
      />
    );
  }
  if (data.length === 0) {
    return (
      <TableRowEmpty
        colSpan={BASE_COLUMN_COUNT}
        message="No buckets to display."
      />
    );
  }

  return (
    <>
      {data.map((bucket, index) => (
        <BucketTableRow
          {...bucket}
          key={`${bucket.label}-${index}-${bucket.region}`}
          onDetails={() => onDetails(bucket)}
          onRemove={() => onRemove(bucket)}
        />
      ))}
    </>
  );
};
