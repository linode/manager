import * as React from 'react';
import ActionMenu, { Action, ActionMenuProps } from 'src/components/ActionMenu';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface Props extends Partial<ActionMenuProps> {
  idx: number;
  triggerCloneFirewallRule: (idx: number) => void;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
}

type CombinedProps = Props;

const FirewallRuleActionMenu: React.FC<CombinedProps> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    idx,
    triggerCloneFirewallRule,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    ...actionMenuProps
  } = props;

  const actions: Action[] = [
    {
      title: 'Edit',
      onClick: () => {
        triggerOpenRuleDrawerForEditing(idx);
      },
    },
    {
      title: 'Clone',
      onClick: () => {
        triggerCloneFirewallRule(idx);
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        triggerDeleteFirewallRule(idx);
      },
    },
  ];

  return (
    <>
      {!matchesSmDown &&
        actions.map((action) => {
          return (
            <InlineMenuAction
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
