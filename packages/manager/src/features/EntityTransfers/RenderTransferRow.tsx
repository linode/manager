import { TransferEntities } from '@linode/api-v4/lib/entity-transfers';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { capitalize } from 'src/utilities/capitalize';
import { pluralize } from 'src/utilities/pluralize';

import { TransfersPendingActionMenu } from './TransfersPendingActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  cellContents: {
    paddingLeft: '1rem',
  },
  createdCell: {
    [theme.breakpoints.down('sm')]: {
      width: '25%',
    },
    width: '20%',
  },
  entitiesCell: {
    [theme.breakpoints.down('md')]: {
      width: '20%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '25%',
    },
    width: '15%',
  },
  expiryCell: {
    [theme.breakpoints.down('sm')]: {
      width: '25%',
    },
    width: '20%',
  },
  icon: {
    '& svg': {
      height: 12,
      width: 12,
    },
    marginLeft: theme.spacing(1),
    marginTop: 2,
  },
  link: {
    ...theme.applyLinkStyles,
    fontSize: '0.875rem',
  },
  row: {
    '&:hover': {
      '& [data-qa-copy-token]': {
        opacity: 1,
      },
    },
  },
  tokenAndCopyIcon: {
    '& [data-qa-copy-token]': {
      opacity: 0,
    },
    display: 'flex',
  },
  tokenCell: {
    [theme.breakpoints.down('md')]: {
      width: '50%',
    },
    width: '40%',
  },
}));

interface Props {
  created: string;
  entities: TransferEntities;
  expiry?: string;
  handleCancelPendingTransferClick: (
    token: string,
    entities: TransferEntities
  ) => void;
  handleTokenClick: (token: string, entities: TransferEntities) => void;
  status?: string;
  token: string;
  transferType?: 'pending' | 'received' | 'sent';
}

type CombinedProps = Props;

export const RenderTransferRow: React.FC<CombinedProps> = (props) => {
  const {
    created,
    entities,
    expiry,
    handleCancelPendingTransferClick,
    handleTokenClick,
    status,
    token,
    transferType,
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
            <CopyTooltip className={`${classes.icon}`} text={token} />
          </div>
        </div>
      </TableCell>
      <Hidden mdDown={transferTypeIsPending || transferTypeIsSent}>
        <TableCell
          className={`${classes.cellContents} ${classes.createdCell}`}
          noWrap
        >
          <DateTimeDisplay value={created} />
        </TableCell>
      </Hidden>
      <Hidden smDown={transferTypeIsPending}>
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
          <TableCell actionCell>
            <TransfersPendingActionMenu
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
