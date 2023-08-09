import { Box } from 'src/components/Box';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Typography, TypographyProps } from 'src/components/Typography';

export interface HeaderProps {
  children?: React.ReactNode;
  isSummaryView?: boolean;
  title?: JSX.Element | string;
  variant?: TypographyProps['variant'];
}

export const EntityHeader = ({
  children,
  isSummaryView,
  title,
  variant = 'h2',
}: HeaderProps) => {
  return (
    <Wrapper>
      {isSummaryView ? (
        <Typography sx={sxTypography} variant={variant}>
          {title}
        </Typography>
      ) : null}
      {children && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {children}
        </Box>
      )}
    </Wrapper>
  );
};

const Wrapper = styled('div', {
  name: 'EntityHeader',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.bgPaper,
  display: 'flex',
  justifyContent: 'space-between',
  margin: 0,
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
  },
  width: '100%',
}));

const sxTypography = {
  padding: 1,
  whiteSpace: 'nowrap',
};
