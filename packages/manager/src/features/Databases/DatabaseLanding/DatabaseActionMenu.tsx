import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme
} from 'src/components/core/styles';
import InlineAction from 'src/components/InlineMenuAction';

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
  triggerDeleteDatabase: (databaseID: number, databaseLabel: string) => void;
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
  const theme = useTheme<Theme>();

  const { databaseID, databaseLabel, triggerDeleteDatabase } = props;
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const actions: Action[] = [
    {
      title: 'Details',
      onClick: () => {
        history.push({ pathname: `/databases/${databaseID}` });
      }
    },
    {
      title: 'Resize',
      onClick: () => {
        alert('Resize not yet implemented');
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
      {!matchesSmDown &&
        actions.map(thisAction => {
          return (
            <InlineAction
              key={thisAction.title}
              actionText={thisAction.title}
              onClick={thisAction.onClick}
            />
          );
        })}
      {matchesSmDown && (
        <ActionMenu
          createActions={() => actions}
          ariaLabel={`Action menu for Database ${props.databaseLabel}`}
        />
      )}
    </div>
  );
};

export default React.memo(DatabaseActionMenu);
