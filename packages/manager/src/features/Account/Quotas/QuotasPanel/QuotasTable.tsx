import { Dialog, ErrorState, Stack } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { Table } from 'src/components/Table/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { useQuotasWithUsageQuery } from '../hooks/useQuotasWithUsageQuery';
import { QuotasIncreaseForm } from './QuotasIncreaseForm';
import { QuotasTableRow } from './QuotasTableRow';

import type { Quota } from '@linode/api-v4';
import type {
  QuotaScope,
  QuotaService,
} from 'src/features/Account/Quotas/quotaServices';
import type { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';

interface QuotasTableProps {
  scope: QuotaScope;
  scopeValue: null | string;
  service: QuotaService;
}

const QUOTA_ROW_MIN_HEIGHT = 58;

export const QuotasTable = (props: QuotasTableProps) => {
  const { scopeValue, service, scope } = props;
  const navigate = useNavigate();

  const isScopeValueProvided = Boolean(scopeValue);
  const isGlobalScope = scope === 'global';

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
    error: quotasError,
    isFetching: isFetchingQuotas,
  } = useQuotasWithUsageQuery({
    service,
    scope,
    scopeValue,
    enabled: isGlobalScope || isScopeValueProvided,
  });

  const testId = `quotas-table-${scope}`;

  if (quotasError) {
    return (
      <Stack data-testid={testId}>
        {' '}
        <ErrorState errorText={quotasError} />;{' '}
      </Stack>
    );
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
        data-testid={testId}
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
              rows={1}
              sx={{ height: QUOTA_ROW_MIN_HEIGHT }}
            />
          ) : !isGlobalScope && !isScopeValueProvided ? (
            <TableRowEmpty
              colSpan={4}
              message="Apply filters above to see quotas and current usage."
              sx={{ height: QUOTA_ROW_MIN_HEIGHT }}
            />
          ) : quotasWithUsage.length === 0 ? (
            <TableRowEmpty
              colSpan={4}
              message="No quotas to display."
              sx={{ height: QUOTA_ROW_MIN_HEIGHT }}
            />
          ) : (
            quotasWithUsage.map((quotaWithUsage, index) => {
              return (
                <QuotasTableRow
                  key={quotaWithUsage.quota.quota_id}
                  quotaRowMinHeight={QUOTA_ROW_MIN_HEIGHT}
                  quotaWithUsage={quotaWithUsage}
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
        title={`Contact Support: Increase ${service.label} Quota`}
      >
        {selectedQuota && (
          <QuotasIncreaseForm
            convertedResourceMetrics={convertedResourceMetrics}
            onClose={() => setSupportModalOpen(false)}
            onSuccess={onIncreaseQuotaTicketCreated}
            open={supportModalOpen}
            quota={selectedQuota}
            scope={scope}
            scopeValue={scopeValue}
            service={service}
          />
        )}
      </Dialog>
    </>
  );
};
