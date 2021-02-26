import * as React from 'react';

import { Disk } from '../../../request.types';
import Graphs from './Graphs';

interface Props {
  diskLabel: string;
  stats: Partial<Disk>;
  timezone: string;
  sysInfoType: string;
  startTime: number;
  endTime: number;
  loading: boolean;
}

type CombinedProps = Props;

const DiskGraph: React.FC<CombinedProps> = props => {
  const {
    diskLabel,
    loading,
    stats,
    timezone,
    sysInfoType,
    startTime,
    endTime,
  } = props;

  const isSwap = stats?.isswap ?? 0;
  const childOf = stats?.childof ?? 0;
  const mounted = stats?.mounted ?? 0;

  const iFree = stats?.fs?.ifree ?? [];
  const iTotal = stats?.fs?.itotal ?? [];
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
      loading={loading}
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

export default DiskGraph;
