import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

import { BucketTableRow } from './BucketTableRow';

import type { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';

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
    handleClickDetails,
    handleClickRemove,
    handleOrderChange,
    order,
    orderBy,
  } = props;

  const isEndpointTypeAvailable = Boolean(data[0]?.endpoint_type);

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
        <React.Fragment>
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
                    active={orderBy === 'cluster'}
                    data-qa-region
                    direction={order}
                    handleClick={handleOrderChange}
                    label="cluster"
                  >
                    Region
                  </TableSortCell>
                </Hidden>
                {isEndpointTypeAvailable && (
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
                )}
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
        </React.Fragment>
      )}
    </Paginate>
  );
};

interface RenderDataProps {
  data: ObjectStorageBucket[];
  onDetails: (bucket: ObjectStorageBucket) => void;
  onRemove: (bucket: ObjectStorageBucket) => void;
}

const RenderData: React.FC<RenderDataProps> = (props) => {
  const { data, onDetails, onRemove } = props;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {data.map((bucket, index) => (
        <BucketTableRow
          {...bucket}
          key={`${bucket.label}-${index}-${bucket.region ?? bucket.cluster}`}
          onDetails={() => onDetails(bucket)}
          onRemove={() => onRemove(bucket)}
        />
      ))}
    </>
  );
};
