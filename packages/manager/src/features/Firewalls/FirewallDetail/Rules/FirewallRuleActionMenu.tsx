import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  idx: number;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerEditFirewallRule: (idx: number) => void;
}

type CombinedProps = Props;

const FirewallRuleActionMenu: React.FC<CombinedProps> = props => {
  const { idx, triggerDeleteFirewallRule, triggerEditFirewallRule } = props;

  const createActions = () => {
    return (closeMenu: Function): Action[] => [
      {
        title: 'Edit',
        onClick: () => {
          closeMenu();
          triggerEditFirewallRule(idx);
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
  };

  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Firewall Rule`}
    />
  );
};

export default React.memo(FirewallRuleActionMenu);
