import { getRegions, Region } from 'linode-js-sdk/lib/regions';
import { actionCreatorFactory } from 'typescript-fsa';
import { createRequestThunk } from '../store.helpers';

const actionCreator = actionCreatorFactory(`@@manager/regions`);

export const regionsRequestActions = actionCreator.async<
  void,
  Region[],
  Linode.ApiFieldError[]
>(`request`);

export const requestRegions = createRequestThunk(regionsRequestActions, () =>
  getRegions().then(response => response.data)
);
