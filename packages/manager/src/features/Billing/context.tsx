import { Account } from 'linode-js-sdk/lib/account'
import * as React from 'react';

import { createHOCForConsumer, Requestable } from 'src/requestableContext';

const accountContext = React.createContext<Requestable<Account>>({
  lastUpdated: 0,
  loading: true,
  request: () => Promise.resolve(),
  update: () => null
});

export const withAccount = createHOCForConsumer<Requestable<Account>>(
  accountContext.Consumer,
  'WithConfigs'
);

export const AccountProvider = accountContext.Provider;

export const AccountConsumer = accountContext.Consumer;
