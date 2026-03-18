import { useProfile } from '@linode/queries';
import { LinkButton } from '@linode/ui';
import { Hidden } from '@linode/ui';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { formatDate } from 'src/utilities/formatDate';

import { ShareGroupActionMenu } from './ShareGroupActionMenu';

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

  const deleteButtonDisabled = !!members_count;
  return (
    <TableRow data-qa-sharegroup-row={id} key={id}>
      <TableCell data-pendo-id={`Images Groups Owned-Group name`}>
        <LinkButton onClick={() => {}}>{label}</LinkButton>
      </TableCell>
      <TableCell>{description}</TableCell>
      <TableCell>{members_count}</TableCell>
      <Hidden smDown>
        <TableCell>{images_count}</TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>
          {created &&
            formatDate(created, {
              timezone: profile?.timezone,
            })}
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>
          {updated &&
            formatDate(updated, {
              timezone: profile?.timezone,
            })}
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <ShareGroupActionMenu deleteButtonDisabled={deleteButtonDisabled} />
      </TableCell>
    </TableRow>
  );
};
