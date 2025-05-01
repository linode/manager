import type * as React from 'react';

export const getDisplayName = <P>(Component: React.ComponentType<P>) => {
  return Component.displayName || Component.name || 'Component';
};
