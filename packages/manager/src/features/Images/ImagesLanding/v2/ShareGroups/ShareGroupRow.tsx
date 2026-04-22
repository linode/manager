import { usePreferences, useProfile } from '@linode/queries';
import { Hidden, LinkButton, Tooltip } from '@linode/ui';
import { truncateEnd } from '@linode/utilities';
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
      style={{ padding: 0 }}
      zebra={isTableStripingEnabled}
    >
      <TableCell
        className="group-column"
        data-pendo-id={`Images Groups Owned-Group name`}
      >
        <Tooltip title={label.length > 32 ? label : ''}>
          <span>
            <LinkButton
              onClick={() => {}}
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                display: 'block',
              }}
            >
              {truncateEnd(label, 32)}
            </LinkButton>
          </span>
        </Tooltip>
      </TableCell>
      <TableCell className="description-column">
        <Tooltip title={description.length > 50 ? description : ''}>
          <span>{truncateEnd(description, 50)}</span>
        </Tooltip>
      </TableCell>
      <TableCell className="membersCount-column">{members_count}</TableCell>
      <Hidden smDown>
        <TableCell className="imagesCount-column">{images_count}</TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell className="created-column">
          {created &&
            formatDate(created, {
              timezone: profile?.timezone,
            })}
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell className="updated-column">
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
