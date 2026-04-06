import { Typography } from '@linode/ui';
import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';

import {
  StyledHelpContainer,
  StyledSearchSuggestionContainer,
} from './SearchBar.styles';

import type { PaperProps } from '@mui/material';

interface CustomPaperProps extends PaperProps {
  isLargeAccount?: boolean;
}

export const SearchSuggestionContainer = (props: CustomPaperProps) => {
  const { children, isLargeAccount, ...rest } = props;

  return (
    <StyledSearchSuggestionContainer {...rest}>
      <div>
        {children}
        {!isLargeAccount && (
          <StyledHelpContainer>
            <HelpOutline sx={{ marginRight: 1 }} />
            <Typography sx={{ fontSize: '0.8rem' }}>
              <b>By field:</b> "tag:my-app" "label:my-linode" &nbsp;&nbsp;
              <b>With operators</b>: "tag:my-app AND is:domain"
            </Typography>
          </StyledHelpContainer>
        )}
      </div>
    </StyledSearchSuggestionContainer>
  );
};
