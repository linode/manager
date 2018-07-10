import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  stackScriptID: number;
  stackScriptUsername: string;
  stackScriptLabel: string;
  triggerDelete: (id: number, label: string) => void;
  canDelete: boolean;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const StackScriptActionMenu: React.StatelessComponent<CombinedProps> = (props) => {
  const { stackScriptID, stackScriptUsername,
     history, triggerDelete, stackScriptLabel, canDelete } = props;

  const createActions = () => {
    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Deploy New Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(`/linodes/create?type=fromStackScript` +
            `&stackScriptID=${stackScriptID}&stackScriptUsername=${stackScriptUsername}`);
            e.preventDefault();
          },
        },
      ];

      if (false) {
        actions.push({
          title: 'Edit',
          onClick: (e) => {
            console.log('edit');
          },
        });
      }

      if (canDelete) {
        actions.push({
          title: 'Delete',
          onClick: (e) => {
            triggerDelete(stackScriptID, stackScriptLabel);
            closeMenu();
          },
        });
      }

      return actions;
    };
  }
  return (
    <ActionMenu createActions={createActions()} />
  );
};

export default withRouter(StackScriptActionMenu);
