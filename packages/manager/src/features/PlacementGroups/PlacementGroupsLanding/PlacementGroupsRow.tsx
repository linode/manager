import { AFFINITY_TYPES } from '@linode/api-v4';
import React from 'react';

import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { usePlacementGroupData } from 'src/hooks/usePlacementGroupsData';

import { getAffinityTypeEnforcement } from '../utils';
import { StyledWarningIcon } from './PlacementGroupsRow.styles';

import type { PlacementGroup } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface PlacementGroupsRowProps {
  disabled: boolean;
  handleDeletePlacementGroup: () => void;
  handleEditPlacementGroup: () => void;
  placementGroup: PlacementGroup;
}

export const PlacementGroupsRow = React.memo(
  ({
    disabled,
    handleDeletePlacementGroup,
    handleEditPlacementGroup,
    placementGroup,
  }: PlacementGroupsRowProps) => {
    const {
      affinity_type,
      id,
      is_compliant,
      is_strict,
      label,
    } = placementGroup;
    const { assignedLinodes, linodesCount, region } = usePlacementGroupData({
      placementGroup,
    });
    const actions: Action[] = [
      {
        onClick: handleEditPlacementGroup,
        title: 'Edit',
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
            {label}
          </Link>
          {!is_compliant && (
            <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>
              <StyledWarningIcon />
              Non-compliant
            </Typography>
          )}
        </TableCell>
        <Hidden smDown>
          <TableCell>{AFFINITY_TYPES[affinity_type]}</TableCell>
        </Hidden>
        <Hidden smDown>
          <TableCell>{getAffinityTypeEnforcement(is_strict)}</TableCell>
        </Hidden>
        <TableCell data-testid={`placement-group-${id}-assigned-linodes`}>
          {assignedLinodes?.length === 0 ? (
            '0'
          ) : (
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
          )}
          &nbsp; of {region?.maximum_vms_per_pg ?? 'unknown'}
        </TableCell>
        <Hidden smDown>
          <TableCell>{region?.label}</TableCell>
        </Hidden>
        <TableCell actionCell>
          {actions.map((action) => (
            <InlineMenuAction
              actionText={action.title}
              disabled={disabled}
              key={action.title}
              onClick={action.onClick}
            />
          ))}
        </TableCell>
      </TableRow>
    );
  }
);
