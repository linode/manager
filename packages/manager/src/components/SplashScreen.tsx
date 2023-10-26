import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { srSpeak } from 'src/utilities/accessibility';

import { Box } from './Box';

export const SplashScreen = () => {
  React.useEffect(() => {
    // @TODO: The utilility cases a scrollbar to show in the browser, fix it.
    srSpeak('Loading Linode Cloud Manager', 'polite');
  }, []);

  return (
    <Box
      alignItems="center"
      aria-label="Loading Cloud Manager"
      display="flex"
      height="100vh"
      justifyContent="center"
    >
      <CircleProgress />
    </Box>
  );
};
