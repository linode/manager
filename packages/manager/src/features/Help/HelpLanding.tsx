import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { OtherWays } from './Panels/OtherWays';
import { PopularPosts } from './Panels/PopularPosts';
import { SearchPanel } from './Panels/SearchPanel';
import { styled } from '@mui/material/styles';

export const HelpLanding = () => {
  return (
    <StyledWrapperDiv>
      <DocumentTitleSegment segment="Get Help" />
      <SearchPanel />
      <PopularPosts />
      <OtherWays />
    </StyledWrapperDiv>
  );
};

const StyledWrapperDiv = styled('div', {
  label: 'StyledWrapperDiv',
})(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    padding: `${theme.spacing(2)} ${theme.spacing(14)}`,
  },
}));
