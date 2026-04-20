import { Pagination } from '@akamai/cds-components/react/Pagination';
import {
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react/Table';
import { useRegionsQuery } from '@linode/queries';
import { Hidden } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { ReservedIpsLandingRow } from './ReservedIpsLandingRow';

import type { ReservedIpsActionHandlers } from './ReservedIpsActionMenu';
import type { IPAddress } from '@linode/api-v4';
import type { Order } from '@linode/utilities';
import type { PaginationPropsV2 } from 'src/hooks/usePaginationV2';

const DEFAULT_PAGE_SIZES = [25, 50, 100];

interface Props {
  data: IPAddress[] | undefined;
  handleOrderChange: (newOrderBy: string, newOrder: Order) => void;
  handlers: ReservedIpsActionHandlers;
  order: 'asc' | 'desc';
  orderBy: string;
  pagination: PaginationPropsV2;
  results: number | undefined;
}

export const ReservedIpsLandingTable = ({
  data,
  handleOrderChange,
  handlers,
  order,
  orderBy,
  pagination,
  results,
}: Props) => {
  const theme = useTheme();

  const { data: regions } = useRegionsQuery();

  const regionLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();
    regions?.forEach((r) => map.set(r.id, r.label));
    return map;
  }, [regions]);

  return (
    <>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <Table
          aria-label="List of Reserved IP Addresses"
          style={
            {
              border: `1px solid ${theme.tokens.alias.Border.Normal}`,
              marginTop: '10px',
              '--token-component-table-header-outlined-border':
                theme.tokens.component.Table.Row.Border,
            } as React.CSSProperties
          }
        >
          <TableHead>
            <TableRow
              headerbackground={
                theme.tokens.component.Table.HeaderNested.Background
              }
              headerborder
            >
              <TableHeaderCell
                onSort={() =>
                  handleOrderChange('address', order === 'asc' ? 'desc' : 'asc')
                }
                sortable
                sorted={orderBy === 'address' ? order : undefined}
              >
                IP Address
              </TableHeaderCell>
              <TableHeaderCell>Assigned Resource</TableHeaderCell>
              <Hidden smDown>
                <TableHeaderCell
                  onSort={() =>
                    handleOrderChange(
                      'region',
                      order === 'asc' ? 'desc' : 'asc'
                    )
                  }
                  sortable
                  sorted={orderBy === 'region' ? order : undefined}
                >
                  Region
                </TableHeaderCell>
                <Hidden mdDown>
                  <TableHeaderCell>Tags</TableHeaderCell>
                </Hidden>
              </Hidden>
              <TableHeaderCell style={{ maxWidth: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length === 0 ? (
              <TableRowEmpty
                colSpan={5}
                message="No Reserved IP addresses found."
              />
            ) : (
              data?.map((ip: IPAddress) => (
                <ReservedIpsLandingRow
                  handlers={handlers}
                  ip={ip}
                  key={ip.address}
                  regionLabel={regionLabelMap.get(ip.region) ?? ip.region}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {(results || 0) > MIN_PAGE_SIZE && (
        <Pagination
          count={results || 0}
          onPageChange={(e: CustomEvent<number>) =>
            pagination.handlePageChange(Number(e.detail))
          }
          onPageSizeChange={(
            e: CustomEvent<{ page: number; pageSize: number }>
          ) => pagination.handlePageSizeChange(Number(e.detail.pageSize))}
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={DEFAULT_PAGE_SIZES}
          style={{
            borderLeft: `1px solid ${theme.tokens.alias.Border.Normal}`,
            borderRight: `1px solid ${theme.tokens.alias.Border.Normal}`,
            borderTop: 0,
          }}
        />
      )}
    </>
  );
};
