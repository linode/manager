import { getQuotaUsage } from '@linode/api-v4';
import { Box, CircleProgress, TooltipIcon, Typography } from '@linode/ui';
import { useQueries } from '@tanstack/react-query';
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
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { usePagination } from 'src/hooks/usePagination';
import { useQuotasQuery } from 'src/queries/quotas/quotas';

import { getQuotasFilters } from './utils';

import type { Filter, Quota, QuotaType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface QuotasTableProps {
  hasSelectedLocation?: boolean;
  selectedLocation: SelectOption<Quota['region_applied']> | null;
  selectedService: SelectOption<QuotaType>;
}

const requestIncreaseAction: Action = {
  disabled: false,
  onClick: () => {},
  title: 'Request an Increase',
};

export const QuotasTable = (props: QuotasTableProps) => {
  const { hasSelectedLocation, selectedLocation, selectedService } = props;

  const pagination = usePagination(1, 'quotas-table');

  const filters: Filter = getQuotasFilters({
    location: selectedLocation,
    service: selectedService,
  });

  const { data: quotas, isFetching: isFetchingQuotas } = useQuotasQuery(
    selectedService.value,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filters,
    Boolean(selectedLocation?.value)
  );

  // Fetch the usage for each quota, depending on the service
  const quotaIds = quotas?.data.map((quota) => quota.quota_id) ?? [];
  const quotaUsageQueries = useQueries({
    queries: quotaIds.map((quotaId) => ({
      enabled: selectedService && Boolean(selectedLocation) && Boolean(quotas),
      queryFn: () => getQuotaUsage(selectedService.value, quotaId),
      queryKey: ['quota-usage', selectedService.value, quotaId],
    })),
  });

  // Combine the quotas with their usage
  const quotasWithUsage = React.useMemo(
    () =>
      quotas?.data.map((quota, index) => ({
        ...quota,
        usage: quotaUsageQueries?.[index]?.data,
      })) ?? [],
    [quotas, quotaUsageQueries]
  );

  // Loading logic
  const isFetchingUsage = quotaUsageQueries.some((query) => query.isLoading);

  return (
    <>
      <Table
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          minWidth: theme.breakpoints.values.sm,
        })}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '25%' }}>Quota Name</TableCell>
            <TableCell sx={{ width: '20%' }}>Account Quota Value</TableCell>
            <TableCell sx={{ width: '35%' }}>Usage</TableCell>
            <TableCell sx={{ width: '10%' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {hasSelectedLocation && isFetchingQuotas ? (
            <TableRowLoading columns={4} rows={5} />
          ) : !selectedLocation ? (
            <TableRowEmpty
              colSpan={4}
              message="Apply filters above to see quotas and current usage."
            />
          ) : quotasWithUsage.length === 0 ? (
            <TableRowEmpty
              colSpan={4}
              message="No quotas found for the selected service and location."
            />
          ) : (
            quotasWithUsage.map((quota) => (
              <TableRow key={quota.quota_id}>
                <TableCell>
                  <Box alignItems="center" display="flex" flexWrap="nowrap">
                    <Typography
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {quota.quota_name}
                    </Typography>
                    <TooltipIcon
                      sxTooltipIcon={{
                        position: 'relative',
                        top: -2,
                      }}
                      placement="top"
                      status="help"
                      text={quota.description}
                    />
                  </Box>
                </TableCell>
                <TableCell>{quota.quota_limit}</TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: '80%' }}>
                    {isFetchingUsage ? (
                      <Box alignItems="center" display="flex" gap={1}>
                        <CircleProgress size="sm" />{' '}
                        <Typography>Fetching Data...</Typography>
                      </Box>
                    ) : (
                      <>
                        <BarPercent
                          max={quota.quota_limit}
                          rounded
                          sx={{ mb: 1, mt: 2, padding: '3px' }}
                          value={quota.usage?.used ?? 0}
                        />
                        <Typography sx={{ mb: 1 }}>
                          {quota.usage?.used ?? 'unknown'} of{' '}
                          {quota.quota_limit}{' '}
                          {`${quota.resource_metric}${
                            quota.quota_limit > 1 ? 's' : ''
                          } used`}
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ textAlign: 'right', paddingRight: 0 }}>
                  <ActionMenu
                    actionsList={[requestIncreaseAction]}
                    ariaLabel={`Action menu for quota ${quota.quota_name}`}
                    // TODO LIMITS_M1: Add onOpen
                    onOpen={() => {}}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {selectedLocation && !isFetchingQuotas && (
        <PaginationFooter
          count={quotas?.results ?? 0}
          eventCategory="quotas_table"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
          sx={{ '&.MuiBox-root': { marginTop: 0 } }}
        />
      )}
    </>
  );
};
