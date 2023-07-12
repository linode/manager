import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { Table } from 'src/components/Table';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableBody } from 'src/components/TableBody';
import { TableSortCell } from 'src/components/TableSortCell';
import { TableCell } from 'src/components/TableCell';
import { useRouteQuery } from 'src/queries/aglb/routes';

const RouteLanding = () => {
  const { data: routes } = useRouteQuery();

  console.log('routes', routes);

  return (
    <>
      <DocumentTitleSegment segment="Routes" />
      {/* <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'domain'}
              direction={order}
              label="domain"
              handleClick={handleOrderChange}
            >
              Domain
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
                active={orderBy === 'type'}
                direction={order}
                label="type"
                handleClick={handleOrderChange}
              >
                Type
              </TableSortCell>
              <TableSortCell
                active={orderBy === 'updated'}
                direction={order}
                label="updated"
                handleClick={handleOrderChange}
              >
                Last Modified
              </TableSortCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {domains?.data.map((domain: Domain) => (
            <DomainRow key={domain.id} domain={domain} {...handlers} />
          ))}
        </TableBody>
      </Table> */}
    </>
  );
};

export default RouteLanding;
