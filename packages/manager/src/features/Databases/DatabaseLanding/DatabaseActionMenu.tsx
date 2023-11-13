import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ActionMenu, Action } from 'src/components/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

const useStyles = makeStyles()(() => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0px !important',
  },
}));

export interface ActionHandlers {
  [index: string]: any;
  triggerDeleteDatabase: (databaseID: number, databaseLabel: string) => void;
}

interface Props extends ActionHandlers {
  databaseID: number;
  databaseLabel: string;
  inlineLabel?: string;
}

type CombinedProps = Props;

const DatabaseActionMenu = (props: CombinedProps) => {
  const { classes } = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { databaseID, databaseLabel, triggerDeleteDatabase } = props;

  const actions: Action[] = [
    {
      onClick: () => {
        alert('Resize not yet implemented');
      },
      title: 'Resize',
    },
    {
      onClick: () => {
        if (triggerDeleteDatabase !== undefined) {
          triggerDeleteDatabase(databaseID, databaseLabel);
        }
      },
      title: 'Delete',
    },
  ];

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        actions.map((thisAction) => {
          return (
            <InlineMenuAction
              actionText={thisAction.title}
              key={thisAction.title}
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
