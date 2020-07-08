import { DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    padding: theme.spacing(2),
    ...theme.applyLinkStyles,
    '&:hover': {
      textDecoration: 'none',
      backgroundColor: theme.bg.lightBlue
    }
  }
}));

export interface Handlers {
  onRemove: (domain: string, id: number) => void;
  onDisableOrEnable: (
    status: 'enable' | 'disable',
    domain: string,
    id: number
  ) => void;
  onClone: (domain: string, id: number) => void;
  onEdit: (domain: string, id: number) => void;
  [index: string]: any;
}

interface Props extends Handlers {
  type: 'master' | 'slave';
  domain: string;
  id: number;
  status: DomainStatus;
}

type CombinedProps = Props;

export const DomainActionMenu: React.FC<CombinedProps> = props => {
  const {
    domain,
    id,
    onClone,
    onDisableOrEnable,
    onEdit,
    onRemove,
    status,
    type
  } = props;

  const history = useHistory();
  const classes = useStyles();

  const goToDomain = () => {
    history.push(`/domains/${id}`);
  };

  const handleRemove = () => {
    onRemove(domain, id);
  };

  const handleEdit = () => {
    onEdit(domain, id);
  };

  const handleClone = () => {
    onClone(domain, id);
  };

  const createActions = () => (): Action[] => {
    const baseActions = [
      {
        title: 'Edit',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          handleEdit();
          e.preventDefault();
        }
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          handleRemove();
          e.preventDefault();
        }
      }
    ];

    if (type === 'master') {
      return [
        {
          title: 'Edit DNS Records',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            goToDomain();
            e.preventDefault();
          }
        },
        ...baseActions
      ];
    } else {
      return [...baseActions];
    }
  };

  return (
    <>
      <div className="flex-center">
        <button className={classes.button} onClick={handleClone}>
          Clone
        </button>
        <button
          className={classes.button}
          onClick={() =>
            onDisableOrEnable(
              status === 'active' ? 'disable' : 'enable',
              domain,
              id
            )
          }
        >
          {status === 'active' ? 'Disable' : 'Enable'}
        </button>
      </div>
      <ActionMenu
        createActions={createActions()}
        ariaLabel={`Action menu for Domain ${domain}`}
      />
    </>
  );
};

export default React.memo(DomainActionMenu);
