import { Database } from '@linode/api-v4/lib/databases';
import React from 'react';
import { useHistory } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import PaginationFooter from 'src/components/PaginationFooter';
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

const useStyles = makeStyles(() => ({
  cell: {
    width: '25%',
  },
}));

const DatabaseLanding: React.FC = () => {
  const classes = useStyles();
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
      <LandingHeader
        title="Databases"
        entity="Database"
        docsLink="https://linode.com/docs"
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
              className={classes.cell}
            >
              Label
            </TableSortCell>
            <TableCell className={classes.cell}>Configuration</TableCell>
            <TableSortCell
              active={orderBy === 'engine'}
              direction={order}
              label="engine"
              handleClick={handleOrderChange}
              className={classes.cell}
            >
              Engine
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'created'}
              direction={order}
              label="created"
              handleClick={handleOrderChange}
              className={classes.cell}
            >
              Created
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((database: Database) => (
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
