import * as React from 'react';

import { createHOCForConsumer } from 'src/requestableContext';

import { InnerProps } from './LinodesDetail.container';

export interface Context extends InnerProps {
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
