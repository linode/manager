import { DatabaseInstance } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useDatabasesQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { DatabaseEmptyState } from './DatabaseEmptyState';
import { DatabaseRow } from './DatabaseRow';

const preferenceKey = 'databases';

const DatabaseLanding = () => {
  const history = useHistory();
  const pagination = usePagination(1, preferenceKey);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data, error, isLoading } = useDatabasesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your databases.')[0].reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0) {
    return (
      <>
        <ProductInformationBanner bannerLocation="Databases" />
        <DatabaseEmptyState />
      </>
    );
  }

  return (
    <React.Fragment>
      <ProductInformationBanner bannerLocation="Databases" />
      <LandingHeader
        createButtonText="Create Database Cluster"
        docsLink="https://www.linode.com/docs/products/databases/managed-databases/"
        onButtonClick={() => history.push('/databases/create')}
        title="Database Clusters"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Cluster Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'cluster_size'}
                direction={order}
                handleClick={handleOrderChange}
                label="cluster_size"
              >
                Configuration
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'engine'}
              direction={order}
              handleClick={handleOrderChange}
              label="engine"
            >
              Engine
            </TableSortCell>
            <Hidden mdDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'created'}
                direction={order}
                handleClick={handleOrderChange}
                label="created"
              >
                Created
              </TableSortCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((database: DatabaseInstance) => (
            <DatabaseRow database={database} key={database.id} />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results || 0}
        eventCategory="Databases Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </React.Fragment>
  );
};

export default React.memo(DatabaseLanding);
