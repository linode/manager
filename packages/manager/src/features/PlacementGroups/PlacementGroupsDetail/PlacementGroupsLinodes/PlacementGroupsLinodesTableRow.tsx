import { usePlacementGroupQuery } from '@linode/queries';
import { capitalizeAllWords } from '@linode/utilities';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { ProgressDisplay } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';
import { StyledButton } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow.styles';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import {
  getProgressOrDefault,
  linodeInTransition,
  transitionText,
} from 'src/features/Linodes/transitions';
import { notificationCenterContext } from 'src/features/NotificationCenter/NotificationCenterContext';
import {
  PLACEMENT_GROUP_MIGRATION_INBOUND_MESSAGE,
  PLACEMENT_GROUP_MIGRATION_OUTBOUND_MESSAGE,
} from 'src/features/PlacementGroups/constants';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useInProgressEvents } from 'src/queries/events/events';

import type { Linode } from '@linode/api-v4';

interface Props {
  handleUnassignLinodeModal: (linode: Linode) => void;
  linode: Linode;
}

type MigrationType = 'inbound' | 'outbound' | null;

export const PlacementGroupsLinodesTableRow = React.memo((props: Props) => {
  const { handleUnassignLinodeModal, linode } = props;
  const { label, status } = linode;
  const { id: placementGroupId } = useParams({
    from: '/placement-groups/$id', // todo connie - check about $id/linode
  });
  const notificationContext = React.useContext(notificationCenterContext);
  const isLinodeMigrating = Boolean(linode.placement_group?.migrating_to);
  const { data: placementGroup } = usePlacementGroupQuery(
    Number(placementGroupId),
    isLinodeMigrating // we only really need to fetch the placement group if the linode is migrating
  );
  const { data: events } = useInProgressEvents();
  const recentEvent = events?.find(
    (e) => e.entity?.type === 'linode' && e.entity.id === linode.id
  );
  const iconStatus = getLinodeIconStatus(status);
  const isMigrationInProgress = linodeInTransition(status, recentEvent);
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
        {isMigrationInProgress ? (
          <>
            <StatusIcon status={iconStatus} />
            <StyledButton onClick={notificationContext.openMenu}>
              <ProgressDisplay
                progress={getProgressOrDefault(recentEvent)}
                sx={{ display: 'inline-block' }}
                text={transitionText(status, linode.id, recentEvent)}
              />
            </StyledButton>
          </>
        ) : (
          <>
            <StatusIcon status={iconStatus} />
            {capitalizeAllWords(status.replace('_', ' '))}
          </>
        )}
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
