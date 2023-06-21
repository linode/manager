import * as React from 'react';
import AlgoliaSearchBar from './AlgoliaSearchBar';
import Paper from 'src/components/core/Paper';
import { H1Header } from 'src/components/H1Header/H1Header';
import { styled } from '@mui/material/styles';

export const SearchPanel = () => {
  return (
    <StyledRootContainer>
      <StyledH1Header
        title="What can we help you with?"
        data-qa-search-heading
      />
      <AlgoliaSearchBar />
    </StyledRootContainer>
  );
};

const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.color.green,
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
