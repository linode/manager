import Factory from 'src/factories/factoryProxy';

import { LongviewResponse } from 'src/features/Longview/request.types';
import { AllData, LongviewPackage } from 'src/features/Longview/request.types';

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
    DATA: {},
    NOTIFICATIONS: [],
    VERSION: 0.4,
  }
);

export const longviewLatestStatsFactory = Factory.Sync.makeFactory<
  Partial<AllData>
>({
  ...longviewResponseData(),
});

export const longviewPackageFactory = Factory.Sync.makeFactory<LongviewPackage>(
  {
    current: Factory.each((i) => `${i + 1}.${i + 2}.${i + 3}`),
    held: 0,
    name: Factory.each((i) => `mock-package-${i}`),
    new: Factory.each((i) => `${i + 1}.${i + 2}.${i + 3}`),
  }
);
