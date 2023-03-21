import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import InlineAction from 'src/components/InlineMenuAction';
import { makeStyles, useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useStyles = makeStyles(() => ({
  root: {
    padding: '0px !important',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
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

const DatabaseActionMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { databaseID, databaseLabel, triggerDeleteDatabase } = props;

  const actions: Action[] = [
    {
      title: 'Resize',
      onClick: () => {
        alert('Resize not yet implemented');
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        if (triggerDeleteDatabase !== undefined) {
          triggerDeleteDatabase(databaseID, databaseLabel);
        }
      },
    },
  ];

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        actions.map((thisAction) => {
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
          actionsList={actions}
          ariaLabel={`Action menu for Database ${props.databaseLabel}`}
        />
      )}
    </div>
  );
};

export default React.memo(DatabaseActionMenu);
