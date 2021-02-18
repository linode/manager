import {
  EntityTransfer,
  TransferEntities
} from '@linode/api-v4/lib/entity-transfers';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import Accordion from 'src/components/Accordion';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
// import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import capitalize from 'src/utilities/capitalize';
import ConfirmTransferCancelDialog from './EntityTransfersLanding/ConfirmTransferCancelDialog';
import TransferDetailsDialog from './EntityTransfersLanding/TransferDetailsDialog';
import RenderTransferRow from './RenderTransferRow';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    '& .MuiAccordionDetails-root': {
      padding: 0
    }
  },
  table: {
    width: '100%'
  },
  cellContents: {
    paddingLeft: '1rem'
  },
  actionCell: {
    padding: 0,
    paddingRight: '0 !important'
  },
  link: {
    ...theme.applyLinkStyles,
    fontSize: '0.875rem'
  }
}));

interface Props {
  transferType: string;
  error: APIError[] | null;
  isLoading: boolean;
  transfers?: EntityTransfer[];
}

type CombinedProps = Props;

export const TransfersTable: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { transferType, isLoading, error, transfers } = props;

  const [cancelPendingDialogOpen, setCancelPendingDialogOpen] = React.useState(
    false
  );
  const [tokenBeingCanceled, setTokenBeingCanceled] = React.useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [currentToken, setCurrentToken] = React.useState('');
  const [currentEntities, setCurrentEntities] = React.useState<
    TransferEntities | undefined
  >(undefined);

  // const transfersCount = transfers?.length ?? 0;

  const transferTypeIsPending = transferType === 'pending';
  const transferTypeIsSent = transferType === 'sent';

  const handleCancelPendingTransferClick = (token: string) => {
    setTokenBeingCanceled(token);
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
      <div className={classes.root}>
        <Accordion
          heading={`Transfers ${capitalize(transferType)}`}
          defaultExpanded
        >
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell key="transfer-token-table-header-token">
                  Token
                </TableCell>
                {transferTypeIsPending || transferTypeIsSent ? (
                  <Hidden smDown>
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
                    <Hidden xsDown>
                      <TableCell key="transfer-token-table-header-entities">
                        Entities
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
                      Entities
                    </TableCell>
                    <TableCell key="transfer-token-table-header-status">
                      Status
                    </TableCell>
                  </>
                ) : (
                  <TableCell key="transfer-token-table-header-entities">
                    Entities
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableContentWrapper
                loading={isLoading}
                error={error ?? undefined}
                length={transfers?.length ?? 0}
              >
                {transfers?.map((transfer, idx) => (
                  <RenderTransferRow
                    key={`${transferType}-${idx}`}
                    token={transfer.token}
                    created={transfer.created}
                    entities={transfer.entities}
                    expiry={transfer.expiry}
                    status={transfer.status}
                    transferTypeIsPending={transferTypeIsPending}
                    transferTypeIsSent={transferTypeIsSent}
                    handleCancelPendingTransferClick={
                      handleCancelPendingTransferClick
                    }
                    handleTokenClick={handleTokenClick}
                  />
                ))}
              </TableContentWrapper>
            </TableBody>
          </Table>
        </Accordion>
        {/* {transfersCount > pageSize ? (
        <PaginationFooter
          count={transfersCount}
          handlePageChange={handlePageChange}
          handleSizeChange={() => null} // Transfer tables are going to be sticky at 25
          page={page}
          pageSize={pageSize}
          eventCategory="Entity Transfer Table"
          fixedSize
        />
      ) : null} */}
        {transferTypeIsPending ? (
          // Only Pending Transfers can be canceled.
          <ConfirmTransferCancelDialog
            open={cancelPendingDialogOpen}
            onClose={closeCancelPendingDialog}
            token={tokenBeingCanceled}
          />
        ) : null}
      </div>
      <TransferDetailsDialog
        isOpen={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        token={currentToken}
        entities={currentEntities}
      />
    </>
  );
};

export default React.memo(TransfersTable);
