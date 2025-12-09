import { styled } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { OtherWays } from './Panels/OtherWays';
import { PopularPosts } from './Panels/PopularPosts';
import { SearchPanel } from './Panels/SearchPanel';

export const HelpLanding = () => {
  return (
    <StyledRootContainer>
      <DocumentTitleSegment segment="Get Help" />
      <SearchPanel />
      <PopularPosts />
      <OtherWays />
    </StyledRootContainer>
  );
};

const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    padding: `${theme.spacing(2)} ${theme.spacing(14)}`,
  },
}));

export const helpLandingLazyRoute = createLazyRoute('/')({
  component: HelpLanding,
});
