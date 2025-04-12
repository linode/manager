import { Dialog, ErrorState } from '@linode/ui';
import { useQueries } from '@tanstack/react-query';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

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

import { QuotasIncreaseForm } from './QuotasIncreaseForm';
import { QuotasTableRow } from './QuotasTableRow';
import { getQuotasFilters } from './utils';

import type { Filter, Quota, QuotaType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';

const quotaRowMinHeight = 58;

interface QuotasTableProps {
  selectedLocation: null | SelectOption<Quota['region_applied']>;
  selectedService: SelectOption<QuotaType>;
}

export const QuotasTable = (props: QuotasTableProps) => {
  const { selectedLocation, selectedService } = props;
  const history = useHistory();
  const pagination = usePagination(1, 'quotas-table');
  const hasSelectedLocation = Boolean(selectedLocation);
  const [supportModalOpen, setSupportModalOpen] = React.useState(false);
  const [selectedQuota, setSelectedQuota] = React.useState<Quota | undefined>();

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

  const onIncreaseQuotaTicketCreated = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    history.push({
      pathname: `/support/tickets/${ticketId}`,
      state: { attachmentErrors },
    });
    setSupportModalOpen(false);
  };

  return (
    <>
      <Table
        sx={(theme) => ({
          marginTop: theme.spacingFunction(16),
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
              message="There is no data available for this service and region."
              sx={{ height: quotaRowMinHeight }}
            />
          ) : (
            quotasWithUsage.map((quota, index) => {
              const hasQuotaUsage = quota.usage?.used !== null;

              return (
                <QuotasTableRow
                  hasQuotaUsage={hasQuotaUsage}
                  index={index}
                  key={quota.quota_id}
                  quota={quota}
                  quotaUsageQueries={quotaUsageQueries}
                  setSelectedQuota={setSelectedQuota}
                  setSupportModalOpen={setSupportModalOpen}
                />
              );
            })
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

      <Dialog
        onClose={() => setSupportModalOpen(false)}
        open={supportModalOpen}
        sx={{
          '& .MuiDialog-paper': {
            width: '600px',
          },
        }}
        title="Increase Quota"
      >
        {selectedQuota && (
          <QuotasIncreaseForm
            onClose={() => setSupportModalOpen(false)}
            onSuccess={onIncreaseQuotaTicketCreated}
            open={supportModalOpen}
            quota={selectedQuota}
          />
        )}
      </Dialog>
    </>
  );
};
