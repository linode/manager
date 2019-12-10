import { pathOr } from 'ramda';
import * as React from 'react';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';

import { Disk } from '../../../request.types';
import Graphs from './Graphs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    '& > h6': {
      color: theme.color.grey1,
      '& > strong': {
        color: theme.color.headline
      }
    }
  }
}));

interface Props {
  diskLabel: string;
  stats: Partial<Disk>;
  timezone: string;
  sysInfoType: string;
  startTime: number;
  endTime: number;
}

type CombinedProps = Props & WithTheme;

const DiskPaper: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { diskLabel, stats, timezone, sysInfoType, startTime, endTime } = props;

  const isSwap = pathOr(0, ['isswap'], stats);
  const childOf = pathOr(0, ['childOf'], stats);
  const mounted = pathOr(0, ['mounted'], stats);

  const iFree = pathOr([], ['fs', 'ifree'], stats);
  const iTotal = pathOr([], ['fs', 'itotal'], stats);
  const free = pathOr([], ['fs', 'free'], stats);
  const total = pathOr([], ['fs', 'total'], stats);

  return (
    <Paper className={classes.root}>
      <Graphs
        isSwap={isSwap === 0 ? false : true}
        childOf={childOf === 0 ? false : true}
        sysInfoType={sysInfoType}
        iFree={iFree}
        iTotal={iTotal}
        isMounted={mounted === 0 ? false : true}
        free={free}
        total={total}
        timezone={timezone}
        diskLabel={diskLabel}
        startTime={startTime}
        endTime={endTime}
      />
    </Paper>
  );
};

export default withTheme(DiskPaper);
