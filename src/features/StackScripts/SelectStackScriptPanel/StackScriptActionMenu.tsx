import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  stackScriptID: number;
  stackScriptUsername: string;
  stackScriptLabel: string;
  triggerDelete: (id: number, label: string) => void;
  canDelete: boolean;
  canEdit: boolean;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const StackScriptActionMenu: React.StatelessComponent<CombinedProps> = (props) => {
  const { stackScriptID, stackScriptUsername,
     history, triggerDelete, stackScriptLabel, canDelete, canEdit } = props;

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

      if (canDelete) {
        actions.push(
          {
            title: 'Delete',
            onClick: (e) => {
              closeMenu();
              triggerDelete(stackScriptID, stackScriptLabel);
            },
          },
        );
      }

      if (canEdit) {
        actions.push(
          {
            title: 'Edit',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              history.push(`/stackscripts/${stackScriptID}/edit`);
              e.preventDefault();
            },
          },
          {
            title: 'Make StackScript Public',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              // open a modal here as well
              closeMenu();
              e.preventDefault();
            },
          }
        );
      }

      return actions;
    };
  }
  return (
    <ActionMenu createActions={createActions()} />
  );
};

export default withRouter(StackScriptActionMenu);
