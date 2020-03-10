import * as React from 'react';
import ActionMenu, { Action, ActionMenuProps } from 'src/components/ActionMenu';

interface Props extends Partial<ActionMenuProps> {
  idx: number;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
}

type CombinedProps = Props;

const FirewallRuleActionMenu: React.FC<CombinedProps> = props => {
  const {
    idx,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    ...actionMenuProps
  } = props;

  const createActions = React.useCallback(() => {
    return (closeMenu: Function): Action[] => [
      {
        title: 'Edit',
        onClick: () => {
          closeMenu();
          triggerOpenRuleDrawerForEditing(idx);
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          closeMenu();
          triggerDeleteFirewallRule(idx);
        }
      }
    ];
  }, []);

  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Firewall Rule`}
      {...actionMenuProps}
    />
  );
};

export default React.memo(FirewallRuleActionMenu);
