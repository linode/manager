import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Events from 'src/features/NotificationCenter/Events';
import Notifications from 'src/features/NotificationCenter/Notifications';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: 20,
    paddingTop: theme.spacing(2),
    paddingBottom: 0,
    width: 430,
  },
}));

export interface Props {
  open: boolean;
}

export const NotificationMenu = (props: Props) => {
  const { open } = props;

  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      {open ? (
        <>
          <Notifications />
          <Events />
        </>
      ) : null}
    </Paper>
  );
};

export default React.memo(NotificationMenu);
