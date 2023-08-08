import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import * as React from 'react';

import {
  Action,
  ActionMenu,
  Props as ActionMenuProps,
} from 'src/components/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface FirewallRuleActionMenuProps extends Partial<ActionMenuProps> {
  disabled: boolean;
  idx: number;
  triggerCloneFirewallRule: (idx: number) => void;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
}

export const FirewallRuleActionMenu = React.memo(
  (props: FirewallRuleActionMenuProps) => {
    const theme = useTheme<Theme>();
    const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

    const {
      disabled,
      idx,
      triggerCloneFirewallRule,
      triggerDeleteFirewallRule,
      triggerOpenRuleDrawerForEditing,
      ...actionMenuProps
    } = props;

    const actions: Action[] = [
      {
        disabled,
        onClick: () => {
          triggerOpenRuleDrawerForEditing(idx);
        },
        title: 'Edit',
      },
      {
        disabled,
        onClick: () => {
          triggerCloneFirewallRule(idx);
        },
        title: 'Clone',
      },
      {
        disabled,
        onClick: () => {
          triggerDeleteFirewallRule(idx);
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
