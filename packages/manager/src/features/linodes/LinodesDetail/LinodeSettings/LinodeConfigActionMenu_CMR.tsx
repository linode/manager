import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { makeStyles } from 'src/components/core/styles';

import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';

import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

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
  actionInner: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& a': {
      lineHeight: '1rem'
    }
  },
  inlineActions: {
    display: 'flex',
    alignItems: 'center'
  },
  link: {
    padding: '12.5px 15px',
    width: '6.5em'
  },
  action: {
    marginLeft: 10
  }
}));

type CombinedProps = Props & RouteComponentProps<{}>;

const ConfigActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const handleEdit = () => {
    const { config, onEdit } = props;
    onEdit(config);
  };

  const handleBoot = () => {
    const {
      config: { id, label },
      onBoot
    } = props;
    onBoot(id, label);
  };

  const createConfigActions = React.useCallback((): Action[] => {
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

    return [
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

  return (
    <div className={classes.actionInner}>
      <div className={classes.inlineActions}>
        {inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              onClick={action.onClick}
            />
          );
        })}
      </div>
      <ActionMenu
        className={classes.action}
        createActions={createConfigActions}
        ariaLabel={`Action menu for Linode Config ${props.label}`}
      />
    </div>
  );
};

export default withRouter(ConfigActionMenu);
