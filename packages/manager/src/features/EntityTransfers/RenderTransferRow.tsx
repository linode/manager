import { TransferEntities } from '@linode/api-v4/lib/entity-transfers';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { capitalize } from 'src/utilities/capitalize';
import { pluralize } from 'src/utilities/pluralize';

import {
  StyledButton,
  StyledCopyTooltip,
  StyledCreatedExpiryTableCell,
  StyledDiv,
  StyledEntitiesTableCell,
  StyledTableCell,
  StyledTableRow,
  StyledTokenTableCell,
} from './RenderTransferRow.styles';
import { TransfersPendingActionMenu } from './TransfersPendingActionMenu';

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

export const RenderTransferRow = React.memo((props: Props) => {
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

  const entitiesAndTheirCounts = Object.entries(entities);

  const transferTypeIsPending = transferType === 'pending';
  const transferTypeIsReceived = transferType === 'received';
  const transferTypeIsSent = transferType === 'sent';

  const ConditionalTableCell = !transferTypeIsReceived
    ? StyledTableCell
    : StyledEntitiesTableCell;

  return (
    <StyledTableRow>
      <StyledTokenTableCell noWrap>
        <StyledDiv>
          <StyledButton onClick={() => handleTokenClick(token, entities)}>
            {token}
          </StyledButton>
          <div data-qa-copy-token>
            <StyledCopyTooltip text={token} />
          </div>
        </StyledDiv>
      </StyledTokenTableCell>
      <Hidden mdDown={transferTypeIsPending || transferTypeIsSent}>
        <StyledCreatedExpiryTableCell noWrap>
          <DateTimeDisplay value={created} />
        </StyledCreatedExpiryTableCell>
      </Hidden>
      <Hidden smDown={transferTypeIsPending}>
        <ConditionalTableCell noWrap>
          {entitiesAndTheirCounts.map((entry, idx) => {
            return (
              <span key={idx}>
                {formatEntitiesCell(entry)}
                <br />
              </span>
            );
          })}
        </ConditionalTableCell>
      </Hidden>
      {transferTypeIsPending ? (
        <>
          <StyledCreatedExpiryTableCell noWrap>
            <DateTimeDisplay value={expiry ?? ''} />
          </StyledCreatedExpiryTableCell>
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
        <StyledTableCell>{capitalize(status ?? '')}</StyledTableCell>
      ) : null}
    </StyledTableRow>
  );
});

export const formatEntitiesCell = (
  entityAndCount: [string, number[]]
): string => {
  const [entity, count] = entityAndCount;
  const pluralEntity = capitalize(entity);
  const singleEntity = capitalize(entity.slice(0, -1));

  const entityCount = count.length;

  return `${pluralize(singleEntity, pluralEntity, entityCount)}`;
};
