import { Accordion } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { ConfirmTransferCancelDialog } from './EntityTransfersLanding/ConfirmTransferCancelDialog';
import { TransferDetailsDialog } from './EntityTransfersLanding/TransferDetailsDialog';
import { RenderTransferRow } from './RenderTransferRow';
import { StyledDiv, StyledTable } from './TransfersTable.styles';

import type {
  EntityTransfer,
  TransferEntities,
} from '@linode/api-v4/lib/entity-transfers';
import type { APIError } from '@linode/api-v4/lib/types';

interface Props {
  error: APIError[] | null;
  handlePageChange: (v: number, showSpinner?: boolean | undefined) => void;
  handlePageSizeChange: (v: number) => void;
  isLoading: boolean;
  page: number;
  pageSize: number;
  results: number;
  transferType: 'pending' | 'received' | 'sent';
  transfers?: EntityTransfer[];
}

export const TransfersTable = React.memo((props: Props) => {
  const {
    error,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    page,
    pageSize,
    results,
    transferType,
    transfers,
  } = props;

  const [cancelPendingDialogOpen, setCancelPendingDialogOpen] = React.useState(
    false
  );
  const [tokenBeingCanceled, setTokenBeingCanceled] = React.useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [currentToken, setCurrentToken] = React.useState('');
  const [currentEntities, setCurrentEntities] = React.useState<
    TransferEntities | undefined
  >(undefined);

  const transfersCount = transfers?.length ?? 0;

  const transferTypeIsPending = transferType === 'pending';
  const transferTypeIsSent = transferType === 'sent';

  const handleCancelPendingTransferClick = (
    token: string,
    entities: TransferEntities
  ) => {
    setTokenBeingCanceled(token);
    setCurrentEntities(entities);
    setCancelPendingDialogOpen(true);
  };

  const closeCancelPendingDialog = () => {
    setTokenBeingCanceled('');
    setCancelPendingDialogOpen(false);
  };

  const handleTokenClick = (token: string, entities: TransferEntities) => {
    setCurrentToken(token);
    setCurrentEntities(entities);
    setDetailsDialogOpen(true);
  };

  return (
    <>
      <StyledDiv>
        <Accordion
          defaultExpanded={transfersCount > 0}
          heading={`${capitalize(transferType)} Service Transfers`}
        >
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell key="transfer-token-table-header-token">
                  Token
                </TableCell>
                {transferTypeIsPending || transferTypeIsSent ? (
                  <Hidden mdDown>
                    <TableCell key="transfer-token-table-header-created">
                      Created
                    </TableCell>
                  </Hidden>
                ) : (
                  <TableCell key="transfer-token-table-header-created">
                    Created
                  </TableCell>
                )}
                {transferTypeIsPending ? (
                  <>
                    <Hidden smDown>
                      <TableCell key="transfer-token-table-header-entities">
                        Services
                      </TableCell>
                    </Hidden>
                    <TableCell key="transfer-token-table-header-expiry">
                      Expiry
                    </TableCell>
                    {/*  Empty column header for action column */}
                    <TableCell />
                  </>
                ) : transferTypeIsSent ? (
                  <>
                    <TableCell key="transfer-token-table-header-entities">
                      Services
                    </TableCell>
                    <TableCell key="transfer-token-table-header-status">
                      Status
                    </TableCell>
                  </>
                ) : (
                  <TableCell key="transfer-token-table-header-entities">
                    Services
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableContentWrapper
                loadingProps={{
                  columns: 3,
                  responsive: {
                    // @TODO do this
                  },
                }}
                error={error ?? undefined}
                length={transfers?.length ?? 0}
                loading={isLoading}
              >
                {transfers?.map((transfer, idx) => (
                  <RenderTransferRow
                    handleCancelPendingTransferClick={
                      handleCancelPendingTransferClick
                    }
                    created={transfer.created}
                    entities={transfer.entities}
                    expiry={transfer.expiry}
                    handleTokenClick={handleTokenClick}
                    key={`${transferType}-${idx}`}
                    status={transfer.status}
                    token={transfer.token}
                    transferType={transferType}
                  />
                ))}
              </TableContentWrapper>
            </TableBody>
          </StyledTable>
          <PaginationFooter
            count={results}
            eventCategory="Service Transfer Table"
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
            page={page}
            pageSize={pageSize}
          />
        </Accordion>
        {transferTypeIsPending ? (
          // Only Pending Transfers can be canceled.
          <ConfirmTransferCancelDialog
            entities={currentEntities}
            onClose={closeCancelPendingDialog}
            open={cancelPendingDialogOpen}
            token={tokenBeingCanceled}
          />
        ) : null}
      </StyledDiv>
      <TransferDetailsDialog
        entities={currentEntities}
        isOpen={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        token={currentToken}
      />
    </>
  );
});
