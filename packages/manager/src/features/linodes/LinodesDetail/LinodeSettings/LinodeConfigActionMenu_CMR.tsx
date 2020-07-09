import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';

import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';

interface Props {
  onEdit: (config: Config) => void;
  onDelete: (id: number, label: string) => void;
  onBoot: (linodeId: number, configId: number, label: string) => void;
  config: Config;
  linodeId: number;
  readOnly?: boolean;
  label: string;
}

const useStyles = makeStyles((theme: Theme) => ({
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
    width: '6.5em',
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#3683dc',
      '& span': {
        color: theme.color.white
      }
    },
    '& span': {
      color: '#3683dc'
    }
  },
  action: {
    marginLeft: 10
  },
  powerOnOrOff: {
    ...theme.applyLinkStyles,
    width: '6.5em',
    '&:hover': {
      backgroundColor: '#3683dc',
      color: theme.color.white
    },
    '&[disabled]': {
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    },
    padding: '12.5px 0px'
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
      linodeId,
      onBoot
    } = props;
    onBoot(linodeId, id, label);
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
        title: 'Resize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          // history.push(
          //   `/linodes/${linodeId}/clone/configs?selectedConfig=${config.id}`
          // );
        },
        disabled: readOnly
      },
      {
        title: 'Imagize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          // history.push(
          //   `/linodes/${linodeId}/clone/configs?selectedConfig=${config.id}`
          // );
        },
        disabled: readOnly
      },
      {
        title: 'Clone',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          history.push(
            `/linodes/${linodeId}/clone/configs?selectedConfig=${config.id}`
          );
        },
        disabled: readOnly
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          handleDelete();
        },
        disabled: readOnly,
        tooltip
      }
    ];
  }, [props]);

  return (
    <div className={classes.actionInner}>
      <div className={classes.inlineActions}>
        <button
          className={classes.powerOnOrOff}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleBoot();
          }}
        >
          Boot
        </button>
        <button
          className={classes.powerOnOrOff}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleEdit();
          }}
        >
          Edit
        </button>
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
