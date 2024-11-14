import { Box, CircleProgress } from '@linode/ui';
import * as React from 'react';

import { srSpeak } from 'src/utilities/accessibility';

export const SplashScreen = () => {
  React.useEffect(() => {
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
