import React from 'react';

import { ApplicationStore, useApplicationStore } from 'src/store';

export interface WithApplicationStoreProps {
  store: ApplicationStore;
}

export const withApplicationStore = <Props extends {}>(
  Component: React.ComponentType<Props & WithApplicationStoreProps>
) => (props: Props) => <Component {...props} store={useApplicationStore()} />;
