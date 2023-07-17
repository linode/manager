import HelpOutline from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Typography } from 'src/components/Typography';

interface GuidanceProps {
  text: string;
}

export const Guidance = (props: GuidanceProps) => {
  const { text } = props;

  return (
    <StyledGuidance>
      <StyledTypography>
        <StyledHelpOutline />
        {text}
      </StyledTypography>
    </StyledGuidance>
  );
};

const StyledGuidance = styled('div')(({ theme }) => ({
  backgroundColor: theme.bg.offWhite,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const StyledTypography = styled(Typography)(() => ({
  fontSize: '.8rem',
}));

const StyledHelpOutline = styled(HelpOutline)(({ theme }) => ({
  height: 16,
  marginRight: theme.spacing(1),
  position: 'relative',
  top: 3,
  width: 16,
}));
