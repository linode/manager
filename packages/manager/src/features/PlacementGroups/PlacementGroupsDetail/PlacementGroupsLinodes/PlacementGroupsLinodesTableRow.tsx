import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { capitalizeAllWords } from 'src/utilities/capitalize';

import type { Linode } from '@linode/api-v4';

interface Props {
  linode: Linode;
}

export const PlacementGroupsLinodesTableRow = React.memo((props: Props) => {
  const { linode } = props;
  const { id: linodeId, label, status } = linode;
  const history = useHistory();
  const { id: placementGroupId } = useParams<{ id: string }>();
  const iconStatus = getLinodeIconStatus(status);

  const handleOpenUnassignLinodesDrawer = () => {
    history.replace(
      `/placement-groups/${placementGroupId}/linodes/unassign/${linodeId}`
    );
  };

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
          onClick={handleOpenUnassignLinodesDrawer}
        />
      </TableCell>
    </TableRow>
  );
});
