import { usePreferences, useProfile } from '@linode/queries';
import { Hidden, LinkButton, Tooltip } from '@linode/ui';
import { truncateEnd } from '@linode/utilities';
import { TableRow } from 'akamai-cds-react-components/Table';
import React from 'react';

import { getIsTableStripingEnabled } from 'src/features/Profile/Settings/TableStriping.utils';
import { formatDate } from 'src/utilities/formatDate';

import { ShareGroupActionMenu } from './ShareGroupActionMenu';
import {
  StyledActionMenuWrapper,
  StyledCreatedCell,
  StyledDescriptionCell,
  StyledGroupCell,
  StyledImageCountCell,
  StyledMemberCountCell,
  StyledUpdatedCell,
} from './ShareGroupTable.styles';

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
      style={{ padding: 0 }}
      zebra={isTableStripingEnabled}
    >
      <Tooltip title={label.length > 32 ? label : ''}>
        <StyledGroupCell data-pendo-id={`Images Groups Owned-Group name`}>
          <LinkButton
            onClick={() => {}}
            sx={{
              ...TableCellOverflowStyle,
            }}
          >
            {truncateEnd(label, 32)}
          </LinkButton>
        </StyledGroupCell>
      </Tooltip>
      <Tooltip title={description.length > 50 ? description : ''}>
        <StyledDescriptionCell>
          {truncateEnd(description, 50)}
        </StyledDescriptionCell>
      </Tooltip>
      <StyledMemberCountCell>{members_count}</StyledMemberCountCell>
      <Hidden smDown>
        <StyledImageCountCell>{images_count}</StyledImageCountCell>
      </Hidden>
      <Hidden lgDown>
        <StyledCreatedCell>
          {created &&
            formatDate(created, {
              timezone: profile?.timezone,
            })}
        </StyledCreatedCell>
      </Hidden>
      <Hidden lgDown>
        <StyledUpdatedCell>
          {updated !== null
            ? formatDate(updated, { timezone: profile?.timezone })
            : '–'}
        </StyledUpdatedCell>
      </Hidden>
      <StyledActionMenuWrapper>
        <ShareGroupActionMenu deleteButtonDisabled={!!members_count} />
      </StyledActionMenuWrapper>
    </TableRow>
  );
};
