import * as React from 'react';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import Hidden from 'src/components/core/Hidden';
import LandingHeader from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { CircleProgress } from 'src/components/CircleProgress';
import { DatabaseEmptyState } from './DatabaseEmptyState';
import { DatabaseInstance } from '@linode/api-v4/lib/databases';
import { DatabaseRow } from './DatabaseRow';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useDatabasesQuery } from 'src/queries/databases';
import { useHistory } from 'react-router-dom';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';

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
    return <DatabaseEmptyState />;
  }

  return (
    <React.Fragment>
      <ProductInformationBanner bannerLocation="Databases" warning important />
      <LandingHeader
        title="Database Clusters"
        createButtonText="Create Database Cluster"
        docsLink="https://www.linode.com/docs/products/databases/managed-databases/"
        onButtonClick={() => history.push('/databases/create')}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              label="label"
              handleClick={handleOrderChange}
            >
              Cluster Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
            >
              Status
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'cluster_size'}
                direction={order}
                label="cluster_size"
                handleClick={handleOrderChange}
              >
                Configuration
              </TableSortCell>
            </Hidden>
            <TableCell>Engine</TableCell>
            <Hidden mdDown>
              <TableCell>Region</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'created'}
                direction={order}
                label="created"
                handleClick={handleOrderChange}
              >
                Created
              </TableSortCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((database: DatabaseInstance) => (
            <DatabaseRow key={database.id} database={database} />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="Databases Table"
      />
    </React.Fragment>
  );
};

export default React.memo(DatabaseLanding);
