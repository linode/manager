import * as React from 'react';
import { useParams } from 'react-router-dom';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import {
  PLACEMENT_GROUP_MIGRATION_INBOUND_MESSAGE,
  PLACEMENT_GROUP_MIGRATION_OUTBOUND_MESSAGE,
} from 'src/features/PlacementGroups/constants';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { usePlacementGroupQuery } from 'src/queries/placementGroups';
import { capitalizeAllWords } from 'src/utilities/capitalize';

import type { Linode } from '@linode/api-v4';

interface Props {
  handleUnassignLinodeModal: (linode: Linode) => void;
  linode: Linode;
}

export const PlacementGroupsLinodesTableRow = React.memo((props: Props) => {
  const { handleUnassignLinodeModal, linode } = props;
  const { label, status } = linode;
  const { id: placementGroupId } = useParams<{ id: string }>();
  const isLinodeMigrating = Boolean(linode.placement_group?.migrating_to);
  const { data: placementGroup } = usePlacementGroupQuery(
    Number(placementGroupId),
    isLinodeMigrating // we only really need to fetch the placement group if the linode is migrating
  );
  const iconStatus = getLinodeIconStatus(status);

  const isLinodeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_write',
    grantType: 'linode',
    id: linode.id,
  });

  const migrationType:
    | 'inbound'
    | 'outbound'
    | null = placementGroup?.migrations?.inbound?.find(
    (migration) => migration.linode_id === linode.id
  )
    ? 'inbound'
    : placementGroup?.migrations?.outbound?.find(
        (migration) => migration.linode_id === linode.id
      )
    ? 'outbound'
    : null;

  return (
    <TableRow data-testid={`placement-group-linode-${linode.id}`}>
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
          tooltip={
            isLinodeMigrating
              ? migrationType === 'inbound'
                ? PLACEMENT_GROUP_MIGRATION_INBOUND_MESSAGE
                : PLACEMENT_GROUP_MIGRATION_OUTBOUND_MESSAGE
              : undefined
          }
          actionText="Unassign"
          disabled={isLinodeReadOnly || isLinodeMigrating}
          onClick={() => handleUnassignLinodeModal(linode)}
        />
      </TableCell>
    </TableRow>
  );
});
