import * as React from 'react';
import ActionMenu, { Action, ActionMenuProps } from 'src/components/ActionMenu';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface Props extends Partial<ActionMenuProps> {
  idx: number;
  disabled: boolean;
  triggerCloneFirewallRule: (idx: number) => void;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
}

type CombinedProps = Props;

const FirewallRuleActionMenu: React.FC<CombinedProps> = (props) => {
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
              disabled={action.disabled}
              key={action.title}
              actionText={action.title}
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
};

export default React.memo(FirewallRuleActionMenu);
