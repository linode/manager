import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import withProfile from 'src/containers/profile.container';

import { getStackScriptUrl, StackScriptCategory } from '../stackScriptUtils';

interface Props {
  stackScriptID: number;
  stackScriptUsername: string;
  stackScriptLabel: string;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  canModify: boolean;
  canAddLinodes: boolean;
  isPublic: boolean;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  // change until we're actually using it.
  category: StackScriptCategory | string;
}

interface ProfileProps {
  username?: string;
}

type CombinedProps = Props & RouteComponentProps<{}> & ProfileProps;

const StackScriptActionMenu: React.FC<CombinedProps> = props => {
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
    category,
    canAddLinodes
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
          disabled: !canAddLinodes,
          tooltip: !canAddLinodes
            ? "You don't have permissions to add Linodes"
            : undefined,
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
  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for StackScript ${props.stackScriptLabel}`}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(
  withRouter,
  withProfile<ProfileProps, Props>((ownProps, { profileData: profile }) => {
    return {
      username: path(['data', 'username'], profile)
    };
  })
);

export default enhanced(StackScriptActionMenu);
