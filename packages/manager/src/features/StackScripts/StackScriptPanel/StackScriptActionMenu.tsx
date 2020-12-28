import { path, splitAt } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import Hidden from 'src/components/core/Hidden';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
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
  isHeader?: boolean;
}

interface ProfileProps {
  username?: string;
}

type CombinedProps = Props & RouteComponentProps<{}> & ProfileProps;

const StackScriptActionMenu: React.FC<CombinedProps> = props => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

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

  const baseActions: Action[] = [
    {
      title: 'Edit',
      ...readonlyProps,
      onClick: () => {
        history.push(`/stackscripts/${stackScriptID}/edit`);
      }
    },
    {
      title: 'Deploy New Linode',
      disabled: !canAddLinodes,
      tooltip:
        !canAddLinodes && matchesSmDown // test this
          ? "You don't have permissions to add Linodes"
          : undefined,
      onClick: () => {
        history.push(
          getStackScriptUrl(stackScriptUsername, stackScriptID, username)
        );
      }
    },
    {
      title: 'Make StackScript Public',
      ...readonlyProps,
      onClick: () => {
        triggerMakePublic(stackScriptID, stackScriptLabel);
      }
    },
    {
      title: 'Delete',
      ...readonlyProps,
      onClick: () => {
        triggerDelete(stackScriptID, stackScriptLabel);
      }
    }
  ];

  const titlesForPrivateActions = ['Make StackScript Public', 'Delete'];
  const actionsForPublicScripts = baseActions.filter(
    baseAction => !titlesForPrivateActions.includes(baseAction.title)
  );

  const actions = isPublic
    ? category === 'account'
      ? actionsForPublicScripts
      : actionsForPublicScripts.filter(action => action.title !== 'Edit') // if category !== 'account' (i.e., === 'community'), exclude the Edit action.
    : baseActions; // if !isPublic, show all actions

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  const createActions = () => (): Action[] => {
    return menuActions;
  };

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              disabled={action.disabled}
              onClick={action.onClick}
            />
          );
        })}
      {/* Hacky way to only display the action menu button on smaller screens for community StackScripts */}
      {category === 'community' || isPublic ? (
        <Hidden mdUp>
          <ActionMenu
            createActions={createActions()}
            ariaLabel={`Action menu for StackScript ${props.stackScriptLabel}`}
          />
        </Hidden>
      ) : (
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for StackScript ${props.stackScriptLabel}`}
        />
      )}
    </>
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
