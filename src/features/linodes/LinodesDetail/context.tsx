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

const linodeContext = React.createContext<Requestable<Linode.Linode>>({...initialState});
export const withLinode = createHOCForConsumer<Linode.Linode>(linodeContext.Consumer, 'WithLinode');
export const LinodeProvider = linodeContext.Provider;
export const LinodeConsumer = linodeContext.Consumer;

const imageContext = React.createContext<Requestable<Linode.Image>>({...initialState});
export const withImage = createHOCForConsumer<Linode.Image>(imageContext.Consumer, 'WithImage');
export const ImageProvider = imageContext.Provider;
export const ImageConsumer = imageContext.Consumer;
