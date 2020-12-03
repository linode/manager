import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme
} from 'src/components/core/styles';

import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';

import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  onEdit: (config: Config) => void;
  onDelete: (id: number, label: string) => void;
  onBoot: (configId: number, label: string) => void;
  config: Config;
  linodeId: number;
  readOnly?: boolean;
  label: string;
}

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
}));

type CombinedProps = Props & RouteComponentProps<{}>;

const ConfigActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const handleEdit = React.useCallback(() => {
    const { config, onEdit } = props;
    onEdit(config);
  }, [props]);

  const handleBoot = React.useCallback(() => {
    const {
      config: { id, label },
      onBoot
    } = props;
    onBoot(id, label);
  }, [props]);

  const inlineActions = [
    {
      actionText: 'Boot',
      onClick: () => {
        handleBoot();
      }
    },
    {
      actionText: 'Edit',
      onClick: () => {
        handleEdit();
      }
    }
  ];

  const createActions = React.useCallback((): Action[] => {
    const { readOnly, history, linodeId, config } = props;
    const tooltip = readOnly
      ? "You don't have permission to perform this action"
      : undefined;

    const handleDelete = () => {
      const {
        config: { id, label },
        onDelete
      } = props;
      onDelete(id, label);
    };

    const actions: Action[] = [
      {
        title: 'Clone',
        onClick: () => {
          history.push(
            `/linodes/${linodeId}/clone/configs?selectedConfig=${config.id}`
          );
        },
        disabled: readOnly
      },
      {
        title: 'Delete',
        onClick: () => {
          handleDelete();
        },
        disabled: readOnly,
        tooltip
      }
    ];

    if (matchesSmDown) {
      actions.unshift(
        {
          title: 'Boot',
          onClick: () => {
            handleBoot();
          }
        },
        {
          title: 'Edit',
          onClick: () => {
            handleEdit();
          }
        }
      );
    }

    return actions;
  }, [handleBoot, handleEdit, matchesSmDown, props]);

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              onClick={action.onClick}
            />
          );
        })}
      <ActionMenu
        createActions={createActions}
        ariaLabel={`Action menu for Linode Config ${props.label}`}
      />
    </div>
  );
};

export default withRouter(ConfigActionMenu);
