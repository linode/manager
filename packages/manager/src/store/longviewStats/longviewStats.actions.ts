import { APIError } from 'linode-js-sdk/lib/types';
import {
  LongviewCPU,
  LongviewDisk,
  LongviewLoad,
  LongviewMemory,
  LongviewNetwork,
  LongviewPackage,
  LongviewSystemInfo
} from 'src/features/Longview/request.types.ts';

import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/longview/stats`);

export type ReturnType = Partial<
  LongviewCPU &
    LongviewDisk &
    LongviewLoad &
    LongviewMemory &
    LongviewNetwork &
    LongviewSystemInfo &
    LongviewPackage[]
>;

export const requestClientStats = actionCreator.async<
  {
    api_key: string;
    clientID: number;
  },
  /**
   * This is a partial because we can't make any assumptions on pieces
   * of pieces of the API responses that are guaranteed to exist.
   *
   * There is no documentation on why/when keys are missing from the response
   * so it's easier to just play it safe on the client.
   */
  ReturnType,
  APIError[]
>(`get`);
