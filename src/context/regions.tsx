import * as React from 'react';
import { createHOCForConsumer, Requestable } from 'src/requestableContext';

export interface WithRegionsContext extends Requestable<Linode.Region[]> {
}

const initialState: WithRegionsContext = {
  lastUpdated: 0,
  loading: false,
  request: () => Promise.resolve(),
  update: () => null,
};

const { Provider, Consumer } = React.createContext<WithRegionsContext>({ ...initialState });

export const withRegions = createHOCForConsumer<Linode.Region[]>(Consumer, 'WithRegions');

export const RegionsProvider = Provider;

export const RegionsConsumer = Consumer;
