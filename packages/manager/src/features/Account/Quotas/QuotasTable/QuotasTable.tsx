import { Dialog, ErrorState } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { Table } from 'src/components/Table/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { useGetQuotas } from '../hooks/useGetQuotas';
import { QuotasIncreaseForm } from '../QuotasIncreaseForm';
import { QUOTA_ROW_MIN_HEIGHT } from '../utils';
import { QuotasTableRow } from './QuotasTableRow';

import type { Quota, QuotaType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';

interface QuotasTableProps {
  isGlobalScope: boolean;
  selectedLocation: null | SelectOption<Quota['region_applied']>;
  selectedService: SelectOption<QuotaType>;
}

export const QuotasTable = (props: QuotasTableProps) => {
  const { selectedLocation, selectedService, isGlobalScope } = props;
  const navigate = useNavigate();

  const hasSelectedLocation = Boolean(selectedLocation?.value);
  const collectionName = isGlobalScope ? 'global-quotas' : 'quotas';

  const [supportModalOpen, setSupportModalOpen] = React.useState(false);
  const [selectedQuota, setSelectedQuota] = React.useState<Quota | undefined>();
  const [convertedResourceMetrics, setConvertedResourceMetrics] =
    React.useState<{
      limit: number;
      metric: string;
    }>({
      limit: 0,
      metric: '',
    });

  const {
    data: quotasWithUsage,
    errorMessage: quotasErrorMessage,
    queries: quotaUsageQueries,
    isFetching: isFetchingQuotas,
  } = useGetQuotas({
    selectedLocation: selectedLocation?.value,
    selectedService: selectedService.value,
    collectionName,
    enabled: isGlobalScope ? true : hasSelectedLocation,
  });

  const isNotFoundErrorIgnored = quotasErrorMessage === 'Not found';

  if (quotasErrorMessage && !isNotFoundErrorIgnored) {
    return <ErrorState errorText={quotasErrorMessage} />;
  }

  const onIncreaseQuotaTicketCreated = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    navigate({
      to: `/support/tickets/${ticketId}`,
      state: (prev) => ({
        ...prev,
        attachmentErrors,
      }),
    });
    setSupportModalOpen(false);
  };

  return (
    <>
      <Table
        data-testid="table-endpoint-quotas"
        sx={(theme) => ({
          marginTop: theme.spacingFunction(16),
          minWidth: theme.breakpoints.values.sm,
        })}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '25%' }}>Quota Name</TableCell>
            <TableCell sx={{ width: '30%' }}>Account Quota Value</TableCell>
            <TableCell sx={{ width: '35%' }}>Usage</TableCell>
            <TableCell sx={{ width: '10%' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {isFetchingQuotas ? (
            <TableRowLoading
              columns={4}
              rows={isGlobalScope ? 1 : 3}
              sx={{ height: QUOTA_ROW_MIN_HEIGHT }}
            />
          ) : !isGlobalScope && !hasSelectedLocation ? (
            <TableRowEmpty
              colSpan={4}
              message="Apply filters above to see quotas and current usage."
              sx={{ height: QUOTA_ROW_MIN_HEIGHT }}
            />
          ) : isNotFoundErrorIgnored ? (
            <TableRowEmpty
              colSpan={4}
              message="No quotas to display."
              sx={{ height: QUOTA_ROW_MIN_HEIGHT }}
            />
          ) : quotasWithUsage.length === 0 ? (
            <TableRowEmpty
              colSpan={4}
              message="There is no data available for this service and region."
              sx={{ height: QUOTA_ROW_MIN_HEIGHT }}
            />
          ) : (
            quotasWithUsage.map((quota, index) => {
              return (
                <QuotasTableRow
                  hasUsage={
                    quota.has_usage === true || quota.has_usage === undefined
                  }
                  index={index}
                  isDataPresent={quota.usage?.usage !== null}
                  key={quota.quota_id}
                  quota={quota}
                  quotaRowMinHeight={QUOTA_ROW_MIN_HEIGHT}
                  quotaUsageQueries={quotaUsageQueries}
                  setConvertedResourceMetrics={setConvertedResourceMetrics}
                  setSelectedQuota={setSelectedQuota}
                  setSupportModalOpen={setSupportModalOpen}
                />
              );
            })
          )}
        </TableBody>
      </Table>

      <Dialog
        onClose={() => setSupportModalOpen(false)}
        open={supportModalOpen}
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: 800,
            width: '100%',
          },
        }}
        title={`Contact Support: Increase ${selectedService.label} Quota`}
      >
        {selectedQuota && (
          <QuotasIncreaseForm
            convertedResourceMetrics={convertedResourceMetrics}
            onClose={() => setSupportModalOpen(false)}
            onSuccess={onIncreaseQuotaTicketCreated}
            open={supportModalOpen}
            quota={selectedQuota}
            selectedService={selectedService}
          />
        )}
      </Dialog>
    </>
  );
};
