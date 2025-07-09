import { usePlacementGroupQuery } from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LinodeStatus } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeStatus';
import {
  PLACEMENT_GROUP_MIGRATION_INBOUND_MESSAGE,
  PLACEMENT_GROUP_MIGRATION_OUTBOUND_MESSAGE,
} from 'src/features/PlacementGroups/constants';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import type { Linode } from '@linode/api-v4';

interface Props {
  handleUnassignLinodeModal: (linode: Linode) => void;
  linode: Linode;
}

type MigrationType = 'inbound' | 'outbound' | null;

export const PlacementGroupsLinodesTableRow = React.memo((props: Props) => {
  const { handleUnassignLinodeModal, linode } = props;
  const { label } = linode;
  const { id: placementGroupId } = useParams({
    from: '/placement-groups/$id', // todo connie - check about $id/linode
  });
  const isLinodeMigrating = Boolean(linode.placement_group?.migrating_to);
  const { data: placementGroup } = usePlacementGroupQuery(
    Number(placementGroupId),
    isLinodeMigrating // we only really need to fetch the placement group if the linode is migrating
  );
  const isLinodeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_write',
    grantType: 'linode',
    id: linode.id,
  });

  const getMigrationType = React.useCallback((): MigrationType => {
    if (!placementGroup?.migrations) {
      return null;
    }

    if (
      placementGroup.migrations.inbound?.some((m) => m.linode_id === linode.id)
    ) {
      return 'inbound';
    }

    if (
      placementGroup.migrations.outbound?.some((m) => m.linode_id === linode.id)
    ) {
      return 'outbound';
    }

    return null;
  }, [placementGroup, linode.id]);

  return (
    <TableRow data-testid={`placement-group-linode-${linode.id}`}>
      <TableCell>
        <Link to={`/linodes/${linode.id}`}>{label}</Link>
      </TableCell>
      <TableCell statusCell>
        <LinodeStatus linodeId={linode.id} linodeStatus={linode.status} />
      </TableCell>
      <TableCell actionCell>
        <InlineMenuAction
          actionText="Unassign"
          disabled={isLinodeReadOnly || isLinodeMigrating}
          onClick={() => handleUnassignLinodeModal(linode)}
          tooltip={
            isLinodeMigrating
              ? getMigrationType() === 'inbound'
                ? PLACEMENT_GROUP_MIGRATION_INBOUND_MESSAGE
                : PLACEMENT_GROUP_MIGRATION_OUTBOUND_MESSAGE
              : undefined
          }
        />
      </TableCell>
    </TableRow>
  );
});
