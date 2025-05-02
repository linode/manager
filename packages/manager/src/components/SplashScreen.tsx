import { Box, CircleProgress } from '@linode/ui';
import { srSpeak } from '@linode/utilities';
import * as React from 'react';

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
