import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import withProfile from 'src/containers/profile.container';

import { getStackScriptUrl } from '../stackScriptUtils';

interface Props {
  stackScriptID: number;
  stackScriptUsername: string;
  stackScriptLabel: string;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  canModify: boolean;
  isPublic: boolean;
  category: string;
  // From Profile HOC
  username?: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const StackScriptActionMenu: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    stackScriptID,
    stackScriptUsername,
    history,
    triggerDelete,
    triggerMakePublic,
    stackScriptLabel,
    canModify,
    isPublic,
    username,
    category
  } = props;

  const readonlyProps = {
    disabled: !canModify,
    tooltip: !canModify
      ? "You don't have permissions to modify this StackScript"
      : undefined
  };

  const createActions = () => {
    return (closeMenu: Function): Action[] => {
      const actions: Action[] = [
        {
          title: 'Deploy New Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(
              getStackScriptUrl(stackScriptUsername, stackScriptID, username)
            );
            e.preventDefault();
          }
        }
      ];

      if (!isPublic) {
        actions.push({
          title: 'Delete',
          ...readonlyProps,
          onClick: e => {
            closeMenu();
            triggerDelete(stackScriptID, stackScriptLabel);
          }
        });
      }

      // We only add the "Edit" option if the current tab/category isn't
      // "Community StackScripts". A user's own public StackScripts are still
      // editable under "Account StackScripts".
      if (category !== 'community') {
        actions.push({
          title: 'Edit',
          ...readonlyProps,
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            history.push(`/stackscripts/${stackScriptID}/edit`);
            e.preventDefault();
          }
        });
      }

      if (!isPublic) {
        actions.push({
          title: 'Make StackScript Public',
          ...readonlyProps,
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            // open a modal here as well
            closeMenu();
            triggerMakePublic(stackScriptID, stackScriptLabel);
          }
        });
      }

      return actions;
    };
  };
  return <ActionMenu createActions={createActions()} />;
};

const enhanced = compose<CombinedProps, Props>(
  withRouter,
  withProfile((ownProps, profile) => {
    return {
      ...ownProps,
      username: path(['username'], profile)
    };
  })
);

export default enhanced(StackScriptActionMenu);
