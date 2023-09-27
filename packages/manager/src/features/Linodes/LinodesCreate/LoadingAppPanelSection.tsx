import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Divider } from 'src/components/Divider';
import { Skeleton } from 'src/components/Skeleton';
import { Typography } from 'src/components/Typography';

interface Props {
  desktopCount: number;
  heading: string;
  mobileCount: number;
}

export const LoadingAppPanelSection = (props: Props) => {
  const { desktopCount, heading, mobileCount } = props;
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const count = matchesSmDown ? mobileCount : desktopCount;

  return (
    <>
      <Typography variant="h2">{heading}</Typography>
      <Divider spacingBottom={16} spacingTop={16} />
      <AppPanelGrid container spacing={2}>
        {Array(count)
          .fill(0)
          .map((_, idx) => (
            <Grid key={idx} md={4} sm={6} xs={12}>
              <StyledSkeleton />
            </Grid>
          ))}
      </AppPanelGrid>
    </>
  );
};

const AppPanelGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(2),
  padding: `${theme.spacing(1)} 0`,
}));

const StyledSkeleton = styled(Skeleton, {
  label: 'StyledSkeleton',
})(({ theme }) => ({
  height: 60,
  transform: 'none',
}));
