import { Namespace } from '@linode/api-v4/lib/cloudview/types';
import Grid from '@mui/material/Grid/Grid';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { CollapsibleTable } from 'src/components/CollapsibleTable/CollapsibleTable';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Flag } from 'src/components/Flag';
import { GroupByTagToggle } from 'src/components/GroupByTagToggle';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

import NamespaceDetail from './NamespaceDetail';

export interface TableProps {
  namespacesList: Namespace[];
}

export const NamespaceList = React.memo((props: TableProps) => {
  const { namespacesList } = props;

  const getTableItems = (data: Namespace[]) => {
    return data.map((namespace) => {
      const OuterTableCells = (
        <>
          <TableCell>{namespace.type}</TableCell>
          <TableCell>
            <Grid
              sx={{
                display: 'flex',
                flexDirection: 'row',
                // justifyContent: 'center',
                margin: '5px',
              }}
            >
              <Flag country={'us'}></Flag>
              <div style={{ padding: '5px' }}> {namespace.region}</div>
            </Grid>
          </TableCell>
          <TableCell>
            <DateTimeDisplay
              displayTime
              value={namespace.created}
            ></DateTimeDisplay>
          </TableCell>
          <TableCell>
            <ActionMenu
              actionsList={[
                {
                  onClick: () => {
                    // Actions
                  },
                  title: 'Delete',
                },
              ]}
              ariaLabel="action menu"
            />
          </TableCell>
        </>
      );

      return {
        InnerTable: <NamespaceDetail namespace={namespace} />,
        OuterTableCells,
        id: namespace.id,
        label: namespace.label,
      };
    });
  };
  return (
    <OrderBy
      data={namespacesList}
      order="desc"
      orderBy="created"
      preferenceKey="cloudview-namespaces"
    >
      {({ data: namespacesList, handleOrderChange, order, orderBy }) => (
        <Paginate data={namespacesList}>
          {({
            count,
            data: data,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <>
              <CollapsibleTable
                TableRowHead={
                  <TableRow>
                    <TableSortCell
                      sx={{
                        width: '33%',
                      }}
                      active={orderBy === 'label'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label="label"
                    >
                      Name
                    </TableSortCell>
                    <TableCell sx={{ width: '18%' }}>Data Type</TableCell>
                    <TableSortCell
                      active={orderBy === 'region'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label="region"
                      sx={{ width: '24%' }}
                    >
                      Region
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'created'}
                      direction={order}
                      handleClick={handleOrderChange}
                      label="created"
                      sx={{ width: '20%' }}
                    >
                      Creation Date (UTC)
                    </TableSortCell>
                    <TableCell sx={{ width: '4%' }}>
                      <GroupByTagToggle
                        toggleGroupByTag={function (): boolean {
                          throw new Error('Function not implemented.');
                        }}
                        isGroupedByTag={false}
                      ></GroupByTagToggle>
                    </TableCell>
                  </TableRow>
                }
                TableItems={getTableItems(data)}
                TableRowEmpty={<TableCell></TableCell>}
              />
              <PaginationFooter
                count={count}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
              />
            </>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
});