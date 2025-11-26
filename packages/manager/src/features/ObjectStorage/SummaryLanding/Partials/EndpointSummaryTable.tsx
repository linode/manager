import { Box, useTheme } from '@linode/ui';
import React from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { EndpointSummaryRow } from './EndpointSummaryRow';

interface Props {
  endpoints: string[];
}

const PAGE_SIZE = 6;

export const EndpointSummaryTable = ({ endpoints }: Props) => {
  const theme = useTheme();
  const [page, setPage] = React.useState(1);
  const [paginatedEndpoints, setPaginatedEndpoints] = React.useState<string[]>(
    []
  );

  React.useEffect(() => {
    const offset = PAGE_SIZE * (page - 1);
    setPaginatedEndpoints(endpoints.slice(offset, offset + PAGE_SIZE));
  }, [endpoints, page]);

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Content Stored</TableCell>
            <TableCell>Objects</TableCell>
            <TableCell>Buckets</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedEndpoints.map((endpoint, index) => {
            return <EndpointSummaryRow endpoint={endpoint} key={index} />;
          })}
        </TableBody>
      </Table>

      <PaginationFooter
        count={endpoints.length}
        eventCategory="Endpoints Table"
        fixedSize={true}
        handlePageChange={setPage}
        handleSizeChange={() => {}}
        page={page}
        pageSize={PAGE_SIZE}
        sx={{ padding: theme.spacingFunction(4) }}
      />
    </Box>
  );
};
