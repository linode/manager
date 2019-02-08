import * as React from 'react';

import { createHOCForConsumer } from 'src/requestableContext';

import { ExtendedLinode } from './LinodesDetail.container';

interface IncrediblyExtendedLinode extends ExtendedLinode {
  _configs: Linode.Config[];
  _disks: Linode.Disk[];
}

export interface Context {
  linode: IncrediblyExtendedLinode;
  updateLinode: (data: Partial<Linode.Linode>) => Promise<Linode.Linode>;
}

const linodeContext = React.createContext<Context>(null as any);

export const withLinode = createHOCForConsumer<Context>(
  linodeContext.Consumer,
  'WithLinode'
);

export default linodeContext;

export const LinodeProvider = linodeContext.Provider;

export const LinodeConsumer = linodeContext.Consumer;
