import * as Factory from 'factory.ts';

import { LongviewResponse } from 'src/features/Longview/request.types';

import {
  longviewDiskFactory,
  longviewCPUFactory,
  longviewSysInfoFactory,
  longviewNetworkFactory,
  LongviewMemoryFactory,
  LongviewLoadFactory,
  UptimeFactory,
} from './longviewDisks';

const longviewResponseData = () => {
  const diskData = longviewDiskFactory.build();
  const cpuData = longviewCPUFactory.build();
  const sysinfoData = longviewSysInfoFactory.build();
  const networkData = longviewNetworkFactory.build();
  const memoryData = LongviewMemoryFactory.build();
  const loadData = LongviewLoadFactory.build();
  const uptimeData = UptimeFactory.build();

  return {
    ...diskData,
    ...cpuData,
    ...sysinfoData,
    ...networkData,
    ...memoryData,
    ...loadData,
    ...uptimeData,
  };
};

export const longviewResponseFactory = Factory.Sync.makeFactory<LongviewResponse>(
  {
    ACTION: 'getLatestValue',
    DATA: longviewResponseData(),
    NOTIFICATIONS: [],
    VERSION: 0.4,
  }
);
