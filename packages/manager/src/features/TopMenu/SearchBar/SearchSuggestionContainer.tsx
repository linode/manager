import { Box, Paper } from '@linode/ui';
import { styled } from '@mui/material';
import * as React from 'react';

import type { PaperProps, Theme } from '@mui/material';

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
          <Box
            sx={(theme: Theme) => ({
              borderTop: `1px solid ${theme.palette.divider}`,
              fontSize: '0.875rem',
              padding: theme.spacing(1),
            })}
          >
            <b>By field:</b> "tag:my-app" "label:my-linode" &nbsp;&nbsp;
            <b>With operators</b>: "tag:my-app AND is:domain"
          </Box>
        )}
      </div>
    </StyledSearchSuggestionContainer>
  );
};

const StyledSearchSuggestionContainer = styled(Paper)({
  '& .MuiAutocomplete-listbox': {},
  padding: 0,
  width: '100%',
});
