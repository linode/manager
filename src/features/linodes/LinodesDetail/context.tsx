import * as React from 'react';

import { createHOCForConsumer, Requestable } from 'src/requestableContext';

const initialState = {
  lastUpdated: 0,
  loading: true,
  request: () => Promise.resolve(),
  update: () => null,
};

const configsContext = React.createContext<Requestable<Linode.Config[]>>({ ...initialState });
export const withConfigs = createHOCForConsumer<Linode.Config[]>(configsContext.Consumer, 'WithConfigs');
export const ConfigsProvider = configsContext.Provider;
export const ConfigsConsumer = configsContext.Consumer;

/**
 * The Linode context is used to provide the currently viewed Linode to child components. createContext
 * requires a default value, which we set as undefined here. In use, the existence of the Linode is
 * checked before the context is ever rendered so we're forcing the type here.
 */
const linodeContext = React.createContext<Linode.Linode>(undefined as any);
export const withLinode = createHOCForConsumer<Linode.Linode>(linodeContext.Consumer, 'WithLinode');
export const LinodeProvider = linodeContext.Provider;
export const LinodeConsumer = linodeContext.Consumer;

