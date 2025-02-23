import { Box, CircleProgress, TooltipIcon } from '@linode/ui';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { BarPercent } from 'src/components/BarPercent/BarPercent';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import type { Quota, QuotaUsage } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface QuotaWithUsage extends Quota {
  usage: QuotaUsage | undefined;
}

interface QuotasTableProps {
  hasSelectedLocation?: boolean;
  isLoading?: boolean;
  quotasWithUsage: QuotaWithUsage[];
}

const requestIncreaseAction: Action = {
  disabled: false,
  onClick: () => {},
  title: 'Request an Increase',
};

export const QuotasTable = (props: QuotasTableProps) => {
  const { hasSelectedLocation, isLoading, quotasWithUsage } = props;
  return (
    <>
      <Table
        sx={(theme) => ({
          marginTop: theme.spacing(2),
        })}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '25%' }}>Quota Name</TableCell>
            <TableCell sx={{ width: '20%' }}>Account Quota Value</TableCell>
            <TableCell sx={{ width: '35%' }}>Usage</TableCell>
            <TableCell sx={{ width: '10%' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hasSelectedLocation && isLoading ? (
            <TableRow>
              <TableCell colSpan={2}>
                <CircleProgress />
              </TableCell>
            </TableRow>
          ) : quotasWithUsage.length === 0 ? (
            <TableRowEmpty
              colSpan={4}
              message="Apply filters above to see quotas and current usage."
            />
          ) : (
            quotasWithUsage.map((quota) => (
              <TableRow key={quota.quota_id}>
                <TableCell>
                  {quota.quota_name}
                  <TooltipIcon
                    sxTooltipIcon={{
                      position: 'relative',
                      top: -2,
                    }}
                    placement="top"
                    status="help"
                    text={quota.description}
                  />
                </TableCell>
                <TableCell>{quota.quota_limit}</TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: '80%' }}>
                    <BarPercent
                      max={quota.quota_limit}
                      rounded
                      sx={{ padding: '3px' }}
                      value={quota.usage?.used ?? 0}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <ActionMenu
                    actionsList={[requestIncreaseAction]}
                    ariaLabel={`Action menu for quota ${quota.quota_name}`}
                    onOpen={() => {}}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <PaginationFooter
        count={quotasWithUsage.length}
        eventCategory="quotas_table"
        handlePageChange={() => {}}
        handleSizeChange={() => {}}
        page={5}
        pageSize={10}
      />
    </>
  );
};
