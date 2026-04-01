import { usePreferences, useProfile } from '@linode/queries';
import { Hidden, LinkButton, Tooltip } from '@linode/ui';
import { TableCell, TableRow } from 'akamai-cds-react-components/Table';
import React from 'react';

import { getIsTableStripingEnabled } from 'src/features/Profile/Settings/TableStriping.utils';
import { formatDate } from 'src/utilities/formatDate';

import { ShareGroupActionMenu } from './ShareGroupActionMenu';
import { StyledActionMenuWrapper } from './ShareGroupTable.styles';

import type { Sharegroup } from '@linode/api-v4';

interface Props {
  shareGroup: Sharegroup;
}

export const ShareGroupRow = (props: Props) => {
  const { shareGroup } = props;
  const { data: profile } = useProfile();

  const {
    created,
    description,
    images_count,
    label,
    members_count,
    updated,
    id,
  } = shareGroup;

  const { data: tableStripingPreference } = usePreferences(
    (preferences) => preferences?.isTableStripingEnabled
  );

  const isTableStripingEnabled = getIsTableStripingEnabled(
    tableStripingPreference
  );

  const TableCellOverflowStyle: React.CSSProperties = {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    display: 'block',
  };

  return (
    <TableRow
      data-qa-sharegroup-row={id}
      key={id}
      rowborder={!isTableStripingEnabled}
      zebra={isTableStripingEnabled}
    >
      <Tooltip title={label}>
        <TableCell data-pendo-id={`Images Groups Owned-Group name`}>
          <LinkButton
            onClick={() => {}}
            sx={{
              ...TableCellOverflowStyle,
            }}
          >
            {label}
          </LinkButton>
        </TableCell>
      </Tooltip>
      <Tooltip title={description}>
        <TableCell
          style={{
            ...TableCellOverflowStyle,
            flex: 2,
          }}
        >
          {description}
        </TableCell>
      </Tooltip>
      <TableCell>{members_count}</TableCell>
      <Hidden smDown>
        <TableCell>{images_count}</TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          {created &&
            formatDate(created, {
              timezone: profile?.timezone,
            })}
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          {updated !== null
            ? formatDate(updated, { timezone: profile?.timezone })
            : '–'}
        </TableCell>
      </Hidden>
      <StyledActionMenuWrapper>
        <ShareGroupActionMenu deleteButtonDisabled={!!members_count} />
      </StyledActionMenuWrapper>
    </TableRow>
  );
};
