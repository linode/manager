import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import ToolBar from 'src/components/core/Toolbar';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    bottom: 0,
    top: 'auto',
    backgroundColor: theme.bg.offWhite,
    zIndex: 99999,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

const FixedToolBar: React.FC<{}> = props => {
  const classes = useStyles();

  return (
    <AppBar className={classes.root} position="fixed">
      <ToolBar className={classes.toolbar}>{props.children}</ToolBar>
    </AppBar>
  );
};

export default FixedToolBar;
