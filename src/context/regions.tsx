import * as React from 'react';
import { createHOCForConsumer, Requestable } from 'src/requestableContext';

export interface WithRegionsProps extends Requestable<Linode.Region[]> {
}

const initialState: WithRegionsProps = {
  lastUpdated: 0,
  loading: false,
  request: () => Promise.resolve(),
  update: () => null,
};

const { Provider, Consumer } = React.createContext<WithRegionsProps >({ ...initialState });

export const withRegions = createHOCForConsumer<Linode.Region[]>(Consumer, 'WithRegions');

export const RegionsProvider = Provider;

export const RegionsConsumer = Consumer;
