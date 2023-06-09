import * as React from 'react';
import OtherWays from './Panels/OtherWays';
import PopularPosts from './Panels/PopularPosts';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SearchPanel } from './Panels/SearchPanel';
import { styled } from '@mui/material/styles';

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
