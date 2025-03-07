import {
  Box,
  CircleProgress,
  ErrorState,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { useTheme } from '@mui/material/styles';
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
import { quotaQueries } from 'src/queries/quotas/quotas';

import { getQuotaError, getQuotasFilters } from './utils';

import type { Filter, Quota, QuotaType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

const quotaRowMinHeight = 58;

interface QuotasTableProps {
  selectedLocation: SelectOption<Quota['region_applied']> | null;
  selectedService: SelectOption<QuotaType>;
}

const requestIncreaseAction: Action = {
  disabled: false,
  onClick: () => {},
  title: 'Request an Increase',
};

export const QuotasTable = (props: QuotasTableProps) => {
  const { selectedLocation, selectedService } = props;
  const theme = useTheme();
  const pagination = usePagination(1, 'quotas-table');
  const hasSelectedLocation = Boolean(selectedLocation);

  const filters: Filter = getQuotasFilters({
    location: selectedLocation,
    service: selectedService,
  });

  const {
    data: quotas,
    error: quotasError,
    isFetching: isFetchingQuotas,
  } = useQuotasQuery(
    selectedService.value,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filters,
    Boolean(selectedLocation?.value)
  );

  // Quota Usage Queries
  // For each quota, fetch the usage in parallel
  // This will only fetch for the paginated set
  const quotaIds = quotas?.data.map((quota) => quota.quota_id) ?? [];
  const quotaUsageQueries = useQueries({
    queries: quotaIds.map((quotaId) =>
      quotaQueries.service(selectedService.value)._ctx.usage(quotaId)
    ),
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

  if (quotasError) {
    return <ErrorState errorText={quotasError[0].reason} />;
  }

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
            <TableRowLoading
              columns={4}
              rows={5}
              sx={{ height: quotaRowMinHeight }}
            />
          ) : !selectedLocation ? (
            <TableRowEmpty
              colSpan={4}
              message="Apply filters above to see quotas and current usage."
              sx={{ height: quotaRowMinHeight }}
            />
          ) : quotasWithUsage.length === 0 ? (
            <TableRowEmpty
              colSpan={4}
              message="No quotas found for the selected service and location."
              sx={{ height: quotaRowMinHeight }}
            />
          ) : (
            quotasWithUsage.map((quota, index) => (
              <TableRow key={quota.quota_id} sx={{ height: quotaRowMinHeight }}>
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
                    {quotaUsageQueries[index]?.isLoading ? (
                      <Box alignItems="center" display="flex" gap={1}>
                        <CircleProgress size="sm" />{' '}
                        <Typography>Fetching Data...</Typography>
                      </Box>
                    ) : quotaUsageQueries[index]?.error ? (
                      <Typography
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                          gap: 1,
                          lineHeight: 1,
                        }}
                      >
                        <ErrorOutline />
                        {getQuotaError(quotaUsageQueries, index)}
                      </Typography>
                    ) : quota.usage?.used !== null ? (
                      <>
                        <BarPercent
                          customColors={[
                            {
                              color: theme.tokens.color.Red[80],
                              percentage: 81,
                            },
                            {
                              color: theme.tokens.color.Orange[80],
                              percentage: 61,
                            },
                            {
                              color: theme.tokens.color.Brand[80],
                              percentage: 1,
                            },
                          ]}
                          max={quota.quota_limit}
                          rounded
                          sx={{ mb: 1, mt: 2, padding: '3px' }}
                          value={quota.usage?.used ?? 0}
                        />
                        <Typography sx={{ mb: 1 }}>
                          {`${quota.usage?.used} of ${quota.quota_limit} ${
                            quota.resource_metric
                          }${quota.quota_limit > 1 ? 's' : ''} used`}
                        </Typography>
                      </>
                    ) : (
                      <Typography>Data not available</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ paddingRight: 0, textAlign: 'right' }}>
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
