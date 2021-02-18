import { TransferEntities } from '@linode/api-v4/lib/entity-transfers';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import capitalize from 'src/utilities/capitalize';
import { pluralize } from 'src/utilities/pluralize';
import ActionMenu from './TransfersPendingActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
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
  token: string;
  created: string;
  entities: TransferEntities;
  expiry?: string;
  status?: string;
  transferTypeIsPending?: boolean;
  transferTypeIsSent?: boolean;
  handleCancelPendingTransferClick: (token: string) => void;
  handleTokenClick: (token: string, entities: TransferEntities) => void;
}

type CombinedProps = Props;

export const RenderTransferRow: React.FC<CombinedProps> = props => {
  const {
    token,
    created,
    entities,
    expiry,
    status,
    transferTypeIsPending,
    transferTypeIsSent,
    handleCancelPendingTransferClick,
    handleTokenClick
  } = props;

  const classes = useStyles();

  const entitiesAndTheirCounts = Object.entries(entities);

  return (
    <TableRow>
      <TableCell className={classes.cellContents} noWrap>
        <button
          className={classes.link}
          onClick={() => handleTokenClick(token, entities)}
        >
          {token}
        </button>
      </TableCell>
      <Hidden smDown>
        <TableCell className={classes.cellContents}>
          <DateTimeDisplay value={created} />
        </TableCell>
      </Hidden>
      <Hidden xsDown={transferTypeIsPending}>
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
      {transferTypeIsPending ? (
        <>
          <TableCell className={classes.cellContents} noWrap>
            <DateTimeDisplay value={expiry ?? ''} />
          </TableCell>
          <TableCell className={classes.actionCell}>
            <ActionMenu
              onCancelClick={() => handleCancelPendingTransferClick(token)}
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

export const formatEntitiesCell = (entityAndCount: [string, number[]]) => {
  const [entity, count] = entityAndCount;
  const pluralEntity = capitalize(entity);
  const singleEntity = capitalize(entity.slice(0, -1));

  const entityCount = count.length;

  return `${pluralize(singleEntity, pluralEntity, entityCount)}`;
};

export default React.memo(RenderTransferRow);
