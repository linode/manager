import React from 'react';
import { Link } from 'react-router-dom';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TextTooltip } from 'src/components/TextTooltip';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { useRegionsQuery } from 'src/queries/regions';

import { MAX_NUMBER_OF_VMS_PER_PLACEMENT_GROUP } from '../constants';

import type { PlacementGroup } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface PlacementGroupsRowProps {
  handleDeletePlacementGroup: () => void;
  handleRenamePlacementGroup: () => void;
  placementGroup: PlacementGroup;
}

export const PlacementGroupsRow = React.memo(
  ({
    handleDeletePlacementGroup,
    handleRenamePlacementGroup,
    placementGroup,
  }: PlacementGroupsRowProps) => {
    const { id, label } = placementGroup;
    const { data: regions } = useRegionsQuery();
    const { data: linodes } = useLinodesQuery();
    const regionLabel =
      regions?.find((region) => region.id === placementGroup.region)?.label ??
      '';
    const numberOfAssignedLinodesAsString =
      placementGroup.linode_ids.length?.toString() ?? '';
    const listOfAssignedLinodes = linodes?.data.filter((linode) =>
      placementGroup.linode_ids.includes(linode.id)
    );
    const compliance = placementGroup.compliant ? 'Compliant' : 'Non-Compliant';
    const actions: Action[] = [
      {
        onClick: handleRenamePlacementGroup,
        title: 'Rename',
      },
      {
        onClick: handleDeletePlacementGroup,
        title: 'Delete',
      },
    ];

    return (
      <TableRow
        ariaLabel={`Placement Group ${label}`}
        data-testid={`placement-group-${id}`}
      >
        <TableCell>
          <Link to={`/placement-groups/${id}`}>{label}</Link>
        </TableCell>
        <TableCell>{compliance}</TableCell>
        <TableCell data-testid={`placement-group-${id}-assigned-linodes`}>
          <TextTooltip
            tooltipText={
              <List>
                {listOfAssignedLinodes?.map((linode, idx) => (
                  <ListItem key={`pg-linode-${idx}`}>{linode.label}</ListItem>
                ))}
              </List>
            }
            displayText={numberOfAssignedLinodesAsString}
            minWidth={200}
          />
          &nbsp; of {MAX_NUMBER_OF_VMS_PER_PLACEMENT_GROUP}
        </TableCell>
        <TableCell>{regionLabel}</TableCell>
        <TableCell actionCell>
          {actions.map((action) => (
            <InlineMenuAction
              actionText={action.title}
              key={action.title}
              onClick={action.onClick}
            />
          ))}
        </TableCell>
      </TableRow>
    );
  }
);
