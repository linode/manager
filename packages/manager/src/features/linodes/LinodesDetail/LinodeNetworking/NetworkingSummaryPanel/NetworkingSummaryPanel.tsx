import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import DNSResolvers from './DNSResolvers';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2) + theme.spacing(1) / 2,
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  transferHistoryContainer: {
    [theme.breakpoints.down('sm')]: {
      order: 3,
    },
  },
  dnsResolverContainer: {
    display: 'flex',
    // justifyContent: 'flex-end',
    // [theme.breakpoints.up('sm')]: {
    //   paddingRight: theme.spacing(),
    // },
    // [theme.breakpoints.down('sm')]: {
    //   order: 2,
    // },
    // [theme.breakpoints.down('xs')]: {
    //   justifyContent: 'center',
    // },
  },
}));

interface Props {
  linodeRegion: string;
  linodeID: number;
  linodeCreated: string;
  linodeLabel: string;
}

type CombinedProps = Props;

const LinodeNetworkingSummaryPanel: React.FC<CombinedProps> = (props) => {
  const { linodeRegion } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <DNSResolvers region={linodeRegion} />
    </Paper>
  );
};

export default React.memo(LinodeNetworkingSummaryPanel);
