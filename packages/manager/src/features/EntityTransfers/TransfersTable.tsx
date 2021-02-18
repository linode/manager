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
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import capitalize from 'src/utilities/capitalize';
import ConfirmTransferCancelDialog from './EntityTransfersLanding/ConfirmTransferCancelDialog';
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
  transferType: 'pending' | 'received' | 'sent';
  error: APIError[] | null;
  isLoading: boolean;
  transfers?: EntityTransfer[];
  results: number;
  page: number;
  pageSize: number;
  handlePageChange: (v: number, showSpinner?: boolean | undefined) => void;
  handlePageSizeChange: (v: number) => void;
}

type CombinedProps = Props;

export const TransfersTable: React.FC<CombinedProps> = props => {
  const {
    transferType,
    isLoading,
    error,
    transfers,
    results,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange
  } = props;

  const classes = useStyles();

  const [cancelPendingDialogOpen, setCancelPendingDialogOpen] = React.useState(
    false
  );
  const [tokenBeingCanceled, setTokenBeingCanceled] = React.useState('');
  // const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  // const [currentToken, setCurrentToken] = React.useState('');
  // const [currentEntities, setCurrentEntities] = React.useState<
  //   TransferEntities | undefined
  // >(undefined);

  const transfersCount = transfers?.length ?? 0;

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

  return (
    <div className={classes.root}>
      <Accordion
        heading={`Transfers ${capitalize(transferType)}`}
        defaultExpanded={transfersCount > 0}
      >
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Token</TableCell>
              <Hidden smDown={transferTypeIsPending || transferTypeIsSent}>
                <TableCell>Created</TableCell>
              </Hidden>
              {transferTypeIsPending ? (
                <>
                  <Hidden xsDown>
                    <TableCell>Entities</TableCell>
                  </Hidden>
                  <TableCell>Expiry</TableCell>
                  {/*  Empty column header for action column */}
                  <TableCell />
                </>
              ) : transferTypeIsSent ? (
                <>
                  <TableCell>Entities</TableCell>
                  <TableCell>Status</TableCell>
                </>
              ) : (
                <TableCell>Entities</TableCell>
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
                  transferType={transferType}
                  handleCancelPendingTransferClick={
                    handleCancelPendingTransferClick
                  }
                />
              ))}
            </TableContentWrapper>
          </TableBody>
        </Table>
      </Accordion>
      {results > pageSize ? (
        <PaginationFooter
          count={results}
          handlePageChange={handlePageChange}
          handleSizeChange={handlePageSizeChange}
          page={page}
          pageSize={pageSize}
          eventCategory="Entity Transfer Table"
        />
      ) : null}
      {transferTypeIsPending ? (
        // Only Pending Transfers can be canceled.
        <ConfirmTransferCancelDialog
          open={cancelPendingDialogOpen}
          onClose={closeCancelPendingDialog}
          token={tokenBeingCanceled}
        />
      ) : null}
    </div>
  );
};

export default React.memo(TransfersTable);
