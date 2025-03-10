import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { Theme } from '@mui/material/styles';
import type {
  Action,
  ActionMenuProps,
} from 'src/components/ActionMenu/ActionMenu';

export interface FirewallRuleActionMenuProps extends Partial<ActionMenuProps> {
  disabled: boolean;
  handleCloneFirewallRule: (idx: number) => void;
  handleDeleteFirewallRule: (idx: number) => void;
  handleOpenRuleDrawerForEditing: (idx: number) => void;
  idx: number;
}

export const FirewallRuleActionMenu = React.memo(
  (props: FirewallRuleActionMenuProps) => {
    const theme = useTheme<Theme>();
    const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

    const {
      disabled,
      handleCloneFirewallRule,
      handleDeleteFirewallRule,
      handleOpenRuleDrawerForEditing,
      idx,
      ...actionMenuProps
    } = props;

    const actions: Action[] = [
      {
        disabled,
        onClick: () => {
          handleOpenRuleDrawerForEditing(idx);
        },
        title: 'Edit',
      },
      {
        disabled,
        onClick: () => {
          handleCloneFirewallRule(idx);
        },
        title: 'Clone',
      },
      {
        disabled,
        onClick: () => {
          handleDeleteFirewallRule(idx);
        },
        title: 'Delete',
      },
    ];

    return (
      <>
        {!matchesSmDown &&
          actions.map((action) => {
            return (
              <InlineMenuAction
                actionText={action.title}
                disabled={action.disabled}
                key={action.title}
                onClick={action.onClick}
              />
            );
          })}
        {matchesSmDown && (
          <ActionMenu
            actionsList={actions}
            ariaLabel={`Action menu for Firewall Rule`}
            {...actionMenuProps}
          />
        )}
      </>
    );
  }
);
