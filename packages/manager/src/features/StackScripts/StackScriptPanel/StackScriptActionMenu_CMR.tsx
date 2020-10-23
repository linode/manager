import classNames from 'classnames';
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
import withProfile from 'src/containers/profile.container';

import { getStackScriptUrl, StackScriptCategory } from '../stackScriptUtils';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.applyLinkStyles,
    color: theme.cmrTextColors.linkActiveLight,
    fontSize: 14,
    height: '100%',
    minWidth: '70px',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      textDecoration: 'none',
      backgroundColor: '#3683dc',
      color: '#ffffff'
    },
    '&:disabled': {
      color: '#bbb'
    }
  },
  stackScriptActionsWrapper: {
    display: 'flex'
  },
  buttonCommunity: {
    marginRight: theme.spacing()
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
      <Hidden smDown>
        <div className="flexCenter">
          {props.category === 'account' && (
            <button
              className={classes.button}
              onClick={() => {
                history.push(`/stackscripts/${stackScriptID}/edit`);
              }}
              disabled={!canModify}
            >
              Edit
            </button>
          )}

          <button
            className={classNames({
              [classes.button]: true,
              [classes.buttonCommunity]:
                props.category === 'community' && props.isHeader === true
            })}
            onClick={() => {
              history.push(
                getStackScriptUrl(stackScriptUsername, stackScriptID, username)
              );
            }}
            disabled={!canAddLinodes}
          >
            Deploy new Linode
          </button>
        </div>
      </Hidden>

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
