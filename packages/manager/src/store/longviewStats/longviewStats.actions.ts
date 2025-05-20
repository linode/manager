import actionCreatorFactory from 'typescript-fsa';

import type {
  LongviewNotification,
  LongviewResponse,
} from 'src/features/Longview/request.types';

export const actionCreator = actionCreatorFactory(`@@manager/longview/stats`);

export const requestClientStats = actionCreator.async<
  {
    api_key: string;
    clientID: number;
    lastUpdated?: number;
  },
  /**
   * This is a partial because we can't make any assumptions on pieces
   * of pieces of the API responses that are guaranteed to exist.
   *
   * There is no documentation on why/when keys are missing from the response
   * so it's easier to just play it safe on the client.
   */
  LongviewResponse['DATA'],
  LongviewNotification[]
>(`get`);
