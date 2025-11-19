import { Box } from '@linode/ui';
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
  handleCloneFirewallRule?: (idx: number) => void; // Cloning is NOT applicable in the case of ruleset
  handleDeleteFirewallRule: (idx: number) => void;
  handleOpenRuleDrawerForEditing?: (idx: number) => void; // Editing is NOT applicable in the case of ruleset
  idx: number;
  isRuleSetRowEnabled: boolean;
}

export const FirewallRuleActionMenu = React.memo(
  (props: FirewallRuleActionMenuProps) => {
    const theme = useTheme<Theme>();
    const matchesLgDown = useMediaQuery(theme.breakpoints.down('lg'));

    const rulesetEditActionToolTipText =
      'Edit your custom Rule Set\u2019s label, description, or rules, using the API. Rule Sets that are defined by a managed-service can only be updated by service accounts.';

    const {
      disabled,
      handleCloneFirewallRule,
      handleDeleteFirewallRule,
      handleOpenRuleDrawerForEditing,
      idx,
      isRuleSetRowEnabled,
      ...actionMenuProps
    } = props;

    const actions: Action[] = [
      {
        disabled: disabled || isRuleSetRowEnabled,
        onClick: () => {
          handleOpenRuleDrawerForEditing?.(idx);
        },
        title: 'Edit',
        tooltip: isRuleSetRowEnabled ? rulesetEditActionToolTipText : undefined,
      },
      ...(!isRuleSetRowEnabled
        ? [
            {
              disabled,
              onClick: () => {
                handleCloneFirewallRule?.(idx);
              },
              title: 'Clone',
            },
          ]
        : []),
      {
        disabled,
        onClick: () => {
          handleDeleteFirewallRule(idx);
        },
        title: isRuleSetRowEnabled ? 'Remove' : 'Delete',
      },
    ];

    return (
      <>
        {!matchesLgDown && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {actions.map((action) => {
              return (
                <InlineMenuAction
                  actionText={action.title}
                  disabled={action.disabled}
                  key={action.title}
                  onClick={action.onClick}
                  tooltip={action.tooltip}
                />
              );
            })}
          </Box>
        )}
        {matchesLgDown && (
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
