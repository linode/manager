import React from 'react';

import { Box } from './Box';

/**
 * A headless component that should be used within a flexbox
 * to add space between flex items.
 */
export const Spacer = () => {
  return <Box flexGrow={1} />;
};
