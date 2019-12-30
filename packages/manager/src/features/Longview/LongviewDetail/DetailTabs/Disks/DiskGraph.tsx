import { pathOr } from 'ramda';
import * as React from 'react';

import { Disk } from '../../../request.types';
import Graphs from './Graphs';

interface Props {
  diskLabel: string;
  stats: Partial<Disk<'yAsNull'>>;
  timezone: string;
  sysInfoType: string;
  startTime: number;
  endTime: number;
}

type CombinedProps = Props;

const DiskPaper: React.FC<CombinedProps> = props => {
  const { diskLabel, stats, timezone, sysInfoType, startTime, endTime } = props;

  const isSwap = pathOr(0, ['isswap'], stats);
  const childOf = pathOr(0, ['childof'], stats);
  const mounted = pathOr(0, ['mounted'], stats);

  const iFree = pathOr([], ['fs', 'ifree'], stats);
  const iTotal = pathOr([], ['fs', 'itotal'], stats);
  const free = pathOr([], ['fs', 'free'], stats);
  const total = pathOr([], ['fs', 'total'], stats);
  const reads = pathOr([], ['reads'], stats);
  const writes = pathOr([], ['writes'], stats);

  return (
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
      reads={reads}
      writes={writes}
    />
  );
};

export default DiskPaper;
