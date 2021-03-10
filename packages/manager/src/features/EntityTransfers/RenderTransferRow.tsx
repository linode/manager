import { TransferEntities } from '@linode/api-v4/lib/entity-transfers';
import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import capitalize from 'src/utilities/capitalize';
import { pluralize } from 'src/utilities/pluralize';
import ActionMenu from './TransfersPendingActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  row: {
    '&:hover': {
      '& [data-qa-copy-token]': {
        opacity: 1,
      },
    },
  },
  cellContents: {
    paddingLeft: '1rem',
  },
  tokenCell: {
    width: '40%',
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
  },
  tokenAndCopyIcon: {
    display: 'flex',
    '& [data-qa-copy-token]': {
      opacity: 0,
    },
  },
  icon: {
    marginLeft: theme.spacing(1),
    marginTop: 2,
    '& svg': {
      width: 12,
      height: 12,
    },
  },
  hide: {
    [theme.breakpoints.up('md')]: {
      opacity: 0,
    },
  },
  createdCell: {
    width: '20%',
    [theme.breakpoints.down('xs')]: {
      width: '25%',
    },
  },
  entitiesCell: {
    width: '15%',
    [theme.breakpoints.down('sm')]: {
      width: '20%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '25%',
    },
  },
  expiryCell: {
    width: '20%',
    [theme.breakpoints.down('xs')]: {
      width: '25%',
    },
  },
  actionCell: {
    padding: 0,
    paddingRight: '0 !important',
  },
  link: {
    ...theme.applyLinkStyles,
    fontSize: '0.875rem',
  },
}));

interface Props {
  token: string;
  created: string;
  entities: TransferEntities;
  expiry?: string;
  status?: string;
  transferType?: 'pending' | 'received' | 'sent';
  handleCancelPendingTransferClick: (
    token: string,
    entities: TransferEntities
  ) => void;
  handleTokenClick: (token: string, entities: TransferEntities) => void;
}

type CombinedProps = Props;

export const RenderTransferRow: React.FC<CombinedProps> = (props) => {
  const {
    token,
    created,
    entities,
    expiry,
    status,
    transferType,
    handleCancelPendingTransferClick,
    handleTokenClick,
  } = props;

  const classes = useStyles();

  const entitiesAndTheirCounts = Object.entries(entities);

  const transferTypeIsPending = transferType === 'pending';
  const transferTypeIsReceived = transferType === 'received';
  const transferTypeIsSent = transferType === 'sent';

  return (
    <TableRow className={classes.row}>
      <TableCell
        className={`${classes.cellContents} ${classes.tokenCell}`}
        noWrap
      >
        <div className={classes.tokenAndCopyIcon}>
          <button
            className={classes.link}
            onClick={() => handleTokenClick(token, entities)}
          >
            {token}
          </button>
          <div data-qa-copy-token>
            <CopyTooltip text={token} className={`${classes.icon}`} />
          </div>
        </div>
      </TableCell>
      <Hidden smDown={transferTypeIsPending || transferTypeIsSent}>
        <TableCell
          className={`${classes.cellContents} ${classes.createdCell}`}
          noWrap
        >
          <DateTimeDisplay value={created} />
        </TableCell>
      </Hidden>
      <Hidden xsDown={transferTypeIsPending}>
        <TableCell
          className={`${classes.cellContents} ${
            !transferTypeIsReceived && classes.entitiesCell
          }`}
          noWrap
        >
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
      {transferTypeIsPending ? (
        <>
          <TableCell
            className={`${classes.cellContents} ${classes.expiryCell}`}
            noWrap
          >
            <DateTimeDisplay value={expiry ?? ''} />
          </TableCell>
          <TableCell className={classes.actionCell}>
            <ActionMenu
              onCancelClick={() =>
                handleCancelPendingTransferClick(token, entities)
              }
            />
          </TableCell>
        </>
      ) : null}
      {transferTypeIsSent ? (
        <TableCell className={classes.cellContents}>
          {capitalize(status ?? '')}
        </TableCell>
      ) : null}
    </TableRow>
  );
};

export const formatEntitiesCell = (
  entityAndCount: [string, number[]]
): string => {
  const [entity, count] = entityAndCount;
  const pluralEntity = capitalize(entity);
  const singleEntity = capitalize(entity.slice(0, -1));

  const entityCount = count.length;

  return `${pluralize(singleEntity, pluralEntity, entityCount)}`;
};

export default React.memo(RenderTransferRow);
