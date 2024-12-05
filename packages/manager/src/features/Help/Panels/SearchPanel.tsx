import { H1Header, Paper } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import AlgoliaSearchBar from './AlgoliaSearchBar';

export const SearchPanel = () => {
  return (
    <StyledRootContainer>
      <StyledH1Header
        data-qa-search-heading
        title="What can we help you with?"
      />
      <AlgoliaSearchBar />
    </StyledRootContainer>
  );
};

const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor:
    theme.name === 'dark'
      ? theme.palette.primary.light
      : theme.palette.primary.dark,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(8),
  },
}));

const StyledH1Header = styled(H1Header, {
  label: 'StyledH1Header',
})(({ theme }) => ({
  color: theme.color.white,
  marginBottom: theme.spacing(),
  position: 'relative',
  textAlign: 'center',
  zIndex: 2,
}));
