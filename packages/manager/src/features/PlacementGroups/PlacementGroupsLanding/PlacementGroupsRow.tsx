import { AFFINITY_TYPES } from '@linode/api-v4';
import React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { usePlacementGroupData } from 'src/hooks/usePlacementGroupsData';

import { StyledWarningIcon } from './PlacementGroupsRow.styles';

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
    const { affinity_type, id, is_compliant, label } = placementGroup;
    const { assignedLinodes, linodesCount, region } = usePlacementGroupData({
      placementGroup,
    });
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
          <Link
            data-testid={`link-to-placement-group-${id}`}
            style={{ marginRight: 8 }}
            to={`/placement-groups/${id}`}
          >
            {label} ({AFFINITY_TYPES[affinity_type]})
          </Link>
          {!is_compliant && (
            <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>
              <StyledWarningIcon />
              Non-compliant
            </Typography>
          )}
        </TableCell>
        <TableCell data-testid={`placement-group-${id}-assigned-linodes`}>
          <TextTooltip
            tooltipText={
              <List>
                {assignedLinodes?.map((linode, idx) => (
                  <ListItem key={`pg-linode-${idx}`}>{linode.label}</ListItem>
                ))}
              </List>
            }
            displayText={`${linodesCount}`}
            minWidth={200}
          />
          &nbsp; of {region?.maximum_vms_per_pg}
        </TableCell>
        <Hidden smDown>
          <TableCell>{region?.label}</TableCell>
        </Hidden>
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
