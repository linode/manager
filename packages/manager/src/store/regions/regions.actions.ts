import { getRegions, Region } from 'linode-js-sdk/lib/regions';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';
import { createRequestThunk } from '../store.helpers';

const actionCreator = actionCreatorFactory(`@@manager/regions`);

export const regionsRequestActions = actionCreator.async<
  void,
  Region[],
  APIError[]
>(`request`);

export const requestRegions = createRequestThunk(regionsRequestActions, () =>
  getRegions().then(response => response.data)
);
