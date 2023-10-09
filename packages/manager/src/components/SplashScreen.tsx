import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { srSpeak } from 'src/utilities/accessibility';

export const SplashScreen = () => {
  React.useEffect(() => {
    srSpeak('Loading Linode Cloud Manager', 'polite');
  }, []);

  return (
    <StyledDiv aria-label="Loading Cloud Manager">
      <CircleProgress />
    </StyledDiv>
  );
};

const StyledDiv = styled('div')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.main,
  display: 'flex',
  height: '100vh',
  justifyContent: 'center',
  left: 0,
  position: 'fixed',
  top: 0,
  width: '100vw',
  zIndex: 100,
}));
