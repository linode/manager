import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '0px !important',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  link: {
    padding: '12px 10px',
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#3683dc',
      '& span': {
        color: '#fff'
      }
    },
    '& span': {
      color: '#3683dc'
    }
  },
  action: {
    marginLeft: 10
  },
  button: {
    minWidth: 70,
    ...theme.applyLinkStyles,
    height: '100%',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#3683dc',
      color: '#fff'
    },
    '&[disabled]': {
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    }
  }
}));

export interface ActionHandlers {
  triggerDeleteDatabase?: (databaseID: number, databaseLabel: string) => void;
  [index: string]: any;
}

interface Props extends ActionHandlers {
  databaseID: number;
  databaseLabel: string;
  inlineLabel?: string;
}

type CombinedProps = Props;

const DatabaseActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const history = useHistory();

  const {
    databaseID,
    databaseLabel,
    inlineLabel,
    triggerDeleteDatabase
  } = props;

  const actions: Action[] = [
    {
      title: 'Details',
      onClick: () => {
        history.push({ pathname: `/databases/${databaseID}` });
      }
    },
    {
      title: 'Delete',
      onClick: () => {
        if (triggerDeleteDatabase !== undefined) {
          triggerDeleteDatabase(databaseID, databaseLabel);
        }
      }
    }
  ];

  return (
    <div className={classes.root}>
      <ActionMenu
        createActions={() => actions}
        inlineLabel={inlineLabel}
        ariaLabel={`Action menu for Database ${props.databaseLabel}`}
      />
    </div>
  );
};

export default React.memo(DatabaseActionMenu);
