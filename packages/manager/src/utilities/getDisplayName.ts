import * as React from 'react';

export const getDisplayName = <P>(Component: React.ComponentType<React.PropsWithChildren<P>>) => {
  return Component.displayName || Component.name || 'Component';
};
