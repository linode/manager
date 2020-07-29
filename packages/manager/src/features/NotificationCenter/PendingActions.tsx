import * as React from 'react';
import { Link } from 'react-router-dom';
import BarPercent from 'src/components/BarPercent/BarPercent_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import NotificationSection from './NotificationSection';

const useStyles = makeStyles((theme: Theme) => ({
  action: {
    display: 'flex',
    flexFlow: 'column nowrap',
    marginBottom: theme.spacing(2)
  },
  bar: {
    marginTop: theme.spacing()
  }
}));

export const PendingActions: React.FC<{}> = _ => {
  const classes = useStyles();
  const actions = [
    {
      id: 'resize-1',
      body: (
        <div className={classes.action}>
          <Typography>
            Linode <Link to="/linode/instances/2">linode-1</Link>
            {` `}
            resize to Linode 64GB Plan (~5 minutes)
          </Typography>
          <BarPercent
            className={classes.bar}
            max={100}
            value={75}
            rounded
            narrow
          />
        </div>
      )
    }
  ];
  return (
    <NotificationSection
      content={actions}
      header="Pending Actions"
      showMoreTarget={'/events'}
    />
  );
};

export default React.memo(PendingActions);
