import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { capitalizeAllWords } from 'src/utilities/capitalize';

import type { Linode } from '@linode/api-v4';

interface Props {
  handleUnassignLinodeModal: (linode: Linode) => void;
  linode: Linode;
}

export const PlacementGroupsLinodesTableRow = React.memo((props: Props) => {
  const { handleUnassignLinodeModal, linode } = props;
  const { label, status } = linode;
  const iconStatus = getLinodeIconStatus(status);

  const isLinodeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_write',
    grantType: 'linode',
    id: linode.id,
  });

  return (
    <TableRow
      ariaLabel={`Linode ${label}`}
      data-testid={`placement-group-linode-${linode.id}`}
    >
      <TableCell>
        <Link to={`/linodes/${linode.id}`}>{label}</Link>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon
          aria-label={`Linode status ${status ?? iconStatus}`}
          status={iconStatus}
        />
        {capitalizeAllWords(linode.status.replace('_', ' '))}
      </TableCell>
      <TableCell actionCell>
        <InlineMenuAction
          actionText="Unassign"
          disabled={isLinodeReadOnly}
          onClick={() => handleUnassignLinodeModal(linode)}
        />
      </TableCell>
    </TableRow>
  );
});
