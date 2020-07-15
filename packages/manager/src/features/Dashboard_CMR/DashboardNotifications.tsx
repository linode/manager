import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    width: '1280px',
    height: '350px',
    backgroundColor: 'pink',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto'
  }
}));

export const Notifications: React.FC<{}> = _ => {
  const classes = useStyles();
  return <div className={classes.root}>DASHBOARD NOTIFICATIONS STUB</div>;
};

export default React.memo(Notifications);
