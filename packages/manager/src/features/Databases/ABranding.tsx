import React from 'react';

import AivenLogo from 'src/assets/icons/aiven-logo.svg';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';

interface BrandingProps {
  style?: React.CSSProperties;
}

const ABranding = ({ style }: BrandingProps) => {
  return (
    <Box
      display="flex"
      id="aBranding"
      justifyContent="center"
      sx={style ? style : { margin: '20px' }}
    >
      <Typography sx={{ display: 'inline-block', textAlign: 'center' }}>
        <BetaChip
          sx={() => ({
            backgroundColor: '#727272',
            color: '#ffffff',
          })}
          component="span"
        />
        <span style={{ color: '#32363C', display: 'flex', marginTop: '8px' }}>
          Powered by <AivenLogo />
        </span>
      </Typography>
    </Box>
  );
};

export default ABranding;
