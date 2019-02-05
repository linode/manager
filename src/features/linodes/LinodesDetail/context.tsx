import * as React from 'react';

import { createHOCForConsumer } from 'src/requestableContext';

import { IncrediblyExtendedLinode } from './LinodesDetail.container';

interface Context {
  linode: IncrediblyExtendedLinode;
}
const linodeContext = React.createContext<Context>(null as any);

export const withLinode = createHOCForConsumer<Context>(
  linodeContext.Consumer,
  'WithLinode'
);
export const LinodeProvider = linodeContext.Provider;
export const LinodeConsumer = linodeContext.Consumer;
