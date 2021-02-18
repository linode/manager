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
import DateTimeDisplay from 'src/components/DateTimeDisplay';
// import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import capitalize from 'src/utilities/capitalize';
import { pluralize } from 'src/utilities/pluralize';
// import ActionMenu from './TransfersPendingActionMenu';
import TransferDetailsDialog from './EntityTransfersLanding/TransferDetailsDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: '2rem',
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

  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [currentToken, setCurrentToken] = React.useState('');
  const [currentEntities, setCurrentEntities] = React.useState<
    TransferEntities | undefined
  >(undefined);

  // const [cancelPendingDialogOpen, setCancelPendingDialogOpen] = React.useState(false);

  // const transfersCount = transfers?.length ?? 0;

  const transferTypeIsPending = transferType === 'pending';
  const transferTypeIsSent = transferType === 'sent';

  // const cancelPendingTransfer = (token: string) => {
  //   setCancelPendingDialogOpen(true);
  // }

  const renderTransferRow = (transfer: EntityTransfer, idx: number) => {
    const entitiesBeingTransferred = transfer.entities;
    const entitiesAndTheirCounts = Object.entries(entitiesBeingTransferred);

    return (
      <TableRow key={`transfer-${idx}`}>
        <TableCell className={classes.cellContents} noWrap>
          <button
            className={classes.link}
            onClick={() => {
              setDetailsDialogOpen(true);
              setCurrentToken(transfer.token);
              setCurrentEntities(transfer.entities);
            }}
          >
            {transfer.token}
          </button>
        </TableCell>
        <Hidden smDown>
          <TableCell className={classes.cellContents}>
            <DateTimeDisplay value={transfer.created} />
          </TableCell>
        </Hidden>
        {transferTypeIsPending ? (
          <Hidden xsDown>
            <TableCell className={classes.cellContents} noWrap>
              {entitiesAndTheirCounts.map((entry, idx) => {
                return (
                  <span key={idx}>
                    {formatEntitiesCell(entry)}
                    <br />
                  </span>
                );
              })}
            </TableCell>
          </Hidden>
        ) : (
          <TableCell className={classes.cellContents} noWrap>
            {entitiesAndTheirCounts.map((entry, idx) => {
              return (
                <span key={idx}>
                  {formatEntitiesCell(entry)}
                  <br />
                </span>
              );
            })}
          </TableCell>
        )}
        {transferTypeIsPending ? (
          <>
            <TableCell className={classes.cellContents} noWrap>
              <DateTimeDisplay value={transfer.expiry} />
            </TableCell>
            <TableCell className={classes.actionCell}>
              Cancel
              {/* <ActionMenu
                onCancel={() => alert('Pending transfer canceled')}
                token={transfer.token}
              /> */}
            </TableCell>
          </>
        ) : null}
        {transferTypeIsSent ? (
          <TableCell className={classes.cellContents}>
            {capitalize(transfer.status)}
          </TableCell>
        ) : null}
      </TableRow>
    );
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
                    <TableCell /> {/*  Empty column header for action column */}
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
                {transfers?.map((transfer, idx) =>
                  renderTransferRow(transfer, idx)
                )}
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

export const formatEntitiesCell = (entityAndCount: [string, number[]]) => {
  const [entity, count] = entityAndCount;
  const pluralEntity = capitalize(entity);
  const singleEntity = capitalize(entity.slice(0, -1));

  const entityCount = count.length;

  return `${pluralize(singleEntity, pluralEntity, entityCount)}`;
};

export default React.memo(TransfersTable);
