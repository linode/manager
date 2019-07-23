import * as React from 'react';

import { createHOCForConsumer, Requestable } from 'src/requestableContext';

const accountContext = React.createContext<Requestable<Linode.Account>>({
  lastUpdated: 0,
  loading: true,
  request: () => Promise.resolve(),
  update: () => null
});

export const withAccount = createHOCForConsumer<Requestable<Linode.Account>>(
  accountContext.Consumer,
  'WithConfigs'
);

export const AccountProvider = accountContext.Provider;

export const AccountConsumer = accountContext.Consumer;
