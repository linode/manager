import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import Hidden from 'src/components/core/Hidden';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
import withProfile from 'src/containers/profile.container';

import { getStackScriptUrl, StackScriptCategory } from '../stackScriptUtils';

const useStyles = makeStyles((theme: Theme) => ({
  stackScriptActionsWrapper: {
    display: 'flex'
  }
}));

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
  const classes = useStyles();
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

  const inlineActions = [
    {
      actionText: 'Deploy New Linode',
      disabled: !canAddLinodes,
      onClick: () => {
        history.push(
          getStackScriptUrl(stackScriptUsername, stackScriptID, username)
        );
      }
    }
  ];

  if (category === 'account') {
    inlineActions.unshift({
      actionText: 'Edit',
      ...readonlyProps,
      onClick: () => {
        history.push(`/stackscripts/${stackScriptID}/edit`);
      }
    });
  }

  const createActions = () => {
    return (): Action[] => {
      const actions: Action[] = [];

      if (matchesSmDown) {
        actions.unshift({
          title: 'Deploy New Linode',
          disabled: !canAddLinodes,
          tooltip: !canAddLinodes
            ? "You don't have permissions to add Linodes"
            : undefined,
          onClick: () => {
            history.push(
              getStackScriptUrl(stackScriptUsername, stackScriptID, username)
            );
          }
        });
      }

      // We only add the "Edit" option if the current tab/category isn't
      // "Community StackScripts". A user's own public StackScripts are still
      // editable under "Account StackScripts".
      if (matchesSmDown && category !== 'community') {
        actions.unshift({
          title: 'Edit',
          ...readonlyProps,
          onClick: () => {
            history.push(`/stackscripts/${stackScriptID}/edit`);
          }
        });
      }

      if (!isPublic) {
        actions.push({
          title: 'Make StackScript Public',
          ...readonlyProps,
          onClick: () => {
            triggerMakePublic(stackScriptID, stackScriptLabel);
          }
        });
        actions.push({
          title: 'Delete',
          ...readonlyProps,
          onClick: () => {
            triggerDelete(stackScriptID, stackScriptLabel);
          }
        });
      }

      return actions;
    };
  };

  return (
    <div className={classes.stackScriptActionsWrapper}>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
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
    </div>
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
