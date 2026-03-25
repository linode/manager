import { usePreferences, useProfile } from '@linode/queries';
import { Hidden, LinkButton } from '@linode/ui';
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

  return (
    <TableRow
      data-qa-sharegroup-row={id}
      key={id}
      rowborder={!isTableStripingEnabled}
      zebra={isTableStripingEnabled}
    >
      <TableCell data-pendo-id={`Images Groups Owned-Group name`}>
        <LinkButton onClick={() => {}}>{label}</LinkButton>
      </TableCell>
      <TableCell>{description}</TableCell>
      <TableCell>{members_count}</TableCell>
      <Hidden smDown>
        <TableCell>{images_count}</TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
          {created &&
            formatDate(created, {
              timezone: profile?.timezone,
            })}
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell style={{ whiteSpace: 'nowrap' }}>
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
