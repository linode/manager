import { DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.applyLinkStyles,
    color: theme.cmrTextColors.linkActiveLight,
    height: '100%',
    minWidth: '70px',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      textDecoration: 'none',
      backgroundColor: '#3683dc',
      color: '#ffffff'
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
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesMdUp = useMediaQuery(theme.breakpoints.up('md'));

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
        title: 'Clone',
        onClick: () => {
          handleClone();
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          handleRemove();
        }
      }
    ];

    if (matchesSmDown) {
      if (type === 'master') {
        baseActions.unshift({
          title: 'Edit',
          onClick: () => {
            handleEdit();
          }
        });
      }
      baseActions.unshift({
        title: status === 'active' ? 'Disable' : 'Enable',
        onClick: () => {
          onDisableOrEnable(
            status === 'active' ? 'disable' : 'enable',
            domain,
            id
          );
        }
      });
      baseActions.unshift({
        title: 'Details',
        onClick: () => {
          type === 'master' ? goToDomain() : handleEdit();
        }
      });
    }

    if (type === 'master' && matchesMdUp) {
      return [
        {
          title: 'Edit',
          onClick: () => {
            handleEdit();
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
      <Hidden smDown>
        <div className="flexCenter">
          <button
            className={classes.button}
            onClick={type === 'master' ? goToDomain : handleEdit}
          >
            Details
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
      </Hidden>
      <ActionMenu
        createActions={createActions()}
        ariaLabel={`Action menu for Domain ${domain}`}
      />
    </>
  );
};

export default React.memo(DomainActionMenu);
