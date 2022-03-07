import * as React from 'react';

const { Provider, Consumer } = React.createContext<any>(null);

export const NodeBalancerProvider = Provider;
export const NodeBalancerConsumer = Consumer;
