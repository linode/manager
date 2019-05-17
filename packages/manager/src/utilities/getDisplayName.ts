import * as React from 'react';

export const getDisplayName = (Component: React.ComponentType) => {
  return Component.displayName || Component.name || 'Component';
};
