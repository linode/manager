import { Config } from '@linode/api-v4/lib/linodes';
import { splitAt } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme
} from 'src/components/core/styles';
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
  const { readOnly, history, linodeId, config } = props;

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const handleEdit = React.useCallback(() => {
    const { onEdit } = props;
    onEdit(config);
  }, [config, props]);

  const handleBoot = React.useCallback(() => {
    const { onBoot } = props;
    const { id, label } = config;
    onBoot(id, label);
  }, [config, props]);

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
    },
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

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
              disabled={action.disabled}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Linode Config ${props.label}`}
      />
    </div>
  );
};

export default withRouter(ConfigActionMenu);
