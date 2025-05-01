import * as React from 'react';

import { Graphs } from './Graphs';

import type { Disk } from '../../../request.types';

interface Props {
  diskLabel: string;
  endTime: number;
  loading: boolean;
  startTime: number;
  stats: Partial<Disk>;
  sysInfoType: string;
  timezone: string;
}

export const DiskGraph = (props: Props) => {
  const {
    diskLabel,
    endTime,
    loading,
    startTime,
    stats,
    sysInfoType,
    timezone,
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
      childOf={childOf === 0 ? false : true}
      diskLabel={diskLabel}
      endTime={endTime}
      free={free}
      iFree={iFree}
      isMounted={mounted === 0 ? false : true}
      isSwap={isSwap === 0 ? false : true}
      iTotal={iTotal}
      loading={loading}
      reads={reads}
      startTime={startTime}
      sysInfoType={sysInfoType}
      timezone={timezone}
      total={total}
      writes={writes}
    />
  );
};
