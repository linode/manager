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

import { getAffinityTypeEnforcement } from '../utils';
import { StyledWarningIcon } from './PlacementGroupsRow.styles';

import type { Linode, PlacementGroup, Region } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface PlacementGroupsRowProps {
  assignedLinodes: Linode[] | undefined;
  disabled: boolean;
  handleDeletePlacementGroup: () => void;
  handleEditPlacementGroup: () => void;
  placementGroup: PlacementGroup;
  region: Region | undefined;
}

export const PlacementGroupsRow = React.memo(
  (props: PlacementGroupsRowProps) => {
    const {
      assignedLinodes,
      disabled,
      handleDeletePlacementGroup,
      handleEditPlacementGroup,
      placementGroup,
      region,
    } = props;
    const {
      affinity_type,
      id,
      is_compliant,
      is_strict,
      label,
    } = placementGroup;
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
              PopperProps={{
                sx: {
                  '& .MuiTooltip-tooltip': {
                    transform: 'translateX(-16px) !important',
                  },
                },
              }}
              tooltipText={
                <List>
                  {assignedLinodes?.map((linode, idx) => (
                    <ListItem key={`pg-linode-${idx}`} sx={{ p: 0.5 }}>
                      <Link to={`linodes/${linode.id}`}>{linode.label}</Link>
                    </ListItem>
                  ))}
                </List>
              }
              displayText={`${assignedLinodes?.length ?? 0}`}
              minWidth={250}
              placement="bottom-start"
            />
          )}
          &nbsp; of{' '}
          {region?.placement_group_limits.maximum_linodes_per_pg ?? 'unknown'}
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
