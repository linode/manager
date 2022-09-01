import { DatabaseInstance } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import Hidden from 'src/components/core/Hidden';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import PaginationFooter from 'src/components/PaginationFooter';
import ProductInformationBanner from 'src/components/ProductInformationBanner';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useDatabasesQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import DatabaseEmptyState from './DatabaseEmptyState';
import { DatabaseRow } from './DatabaseRow';

const preferenceKey = 'databases';

const DatabaseLanding: React.FC = () => {
  const history = useHistory();
  const pagination = usePagination(1, preferenceKey);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'label',
      order: 'desc',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
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
      <ProductInformationBanner
        bannerLocation="Databases"
        productInformationIndicator={false}
        productInformationWarning
      />
      <LandingHeader
        title="Database Clusters"
        createButtonText="Create Database Cluster"
        createButtonWidth={205}
        docsLink="https://www.linode.com/docs/products/databases/managed-databases/"
        onAddNew={() => history.push('/databases/create')}
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
            <Hidden xsDown>
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
            <Hidden smDown>
              <TableCell>Region</TableCell>
            </Hidden>
            <Hidden mdDown>
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
