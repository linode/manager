import * as Factory from 'factory.ts';
import { LongviewResponse } from 'src/features/Longview/request.types';
import { longviewDiskFactory } from './longviewDisks';

export const longviewResponseFactory = Factory.Sync.makeFactory<LongviewResponse>(
  {
    VERSION: 0.4,
    NOTIFICATIONS: [],
    ACTION: 'getValues',
    DATA: longviewDiskFactory.build(),
  }
);
