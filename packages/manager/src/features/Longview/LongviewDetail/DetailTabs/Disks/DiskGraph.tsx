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

  const isSwap = stats?.isswap ?? 0;
  const childOf = stats?.childof ?? 0;
  const mounted = stats?.mounted ?? 0;

  const iFree = stats?.fs?.free ?? [];
  const iTotal = stats?.fs?.total ?? [];
  const free = stats?.fs?.free ?? [];
  const total = stats?.fs?.total ?? [];
  const reads = stats?.reads ?? [];
  const writes = stats?.writes ?? [];

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
