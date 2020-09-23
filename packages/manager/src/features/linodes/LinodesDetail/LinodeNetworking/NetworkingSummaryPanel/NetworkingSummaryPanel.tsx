import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import DNSResolvers from './DNSResolvers';
import NetworkTransfer from './NetworkTransfer';
import TransferHistory from './TransferHistory';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2) + theme.spacing(1) / 2,
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column'
    }
  },
  transferHistoryContainer: {
    padding: '16px 0px',
    [theme.breakpoints.up('md')]: {
      padding: '0px 32px'
    },
    [theme.breakpoints.up('sm')]: {
      padding: '0px 16px'
    },
    [theme.breakpoints.down('sm')]: {
      paddingRight: 0,
      width: '50%'
    },
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(3),
      paddingBottom: 0,
      width: '100%'
    }
  },
  dnsResolverContainer: {
    paddingTop: 8,
    [theme.breakpoints.up('md')]: {
      paddingTop: 0
    }
  }
}));

interface Props {
  linodeRegion: string;
  linodeID: number;
  linodeCreated: string;
  linodeLabel: string;
}

type CombinedProps = Props;

const LinodeNetworkingSummaryPanel: React.FC<CombinedProps> = props => {
  const { linodeID, linodeRegion, linodeCreated, linodeLabel } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <NetworkTransfer linodeID={linodeID} linodeLabel={linodeLabel} />
      <div className={classes.transferHistoryContainer}>
        <TransferHistory linodeID={linodeID} linodeCreated={linodeCreated} />
      </div>
      <Hidden smDown>
        <div className={classes.dnsResolverContainer}>
          <DNSResolvers region={linodeRegion} />
        </div>
      </Hidden>
    </Paper>
  );
};

export default React.memo(LinodeNetworkingSummaryPanel);
