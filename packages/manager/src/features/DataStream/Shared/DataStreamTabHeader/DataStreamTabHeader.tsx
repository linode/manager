import { Button } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import type { Theme } from '@mui/material/styles';

export interface DataStreamTabHeaderProps {
  buttonDataAttrs?: { [key: string]: boolean | string };
  createButtonText?: string;
  disabledCreateButton?: boolean;
  entity?: string;
  loading?: boolean;
  onButtonClick?: () => void;
  spacingBottom?: 0 | 4 | 16 | 24;
}

export const DataStreamTabHeader = ({
  buttonDataAttrs,
  createButtonText,
  disabledCreateButton,
  entity,
  loading,
  onButtonClick,
  spacingBottom = 24,
}: DataStreamTabHeaderProps) => {
  const theme = useTheme();

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const customBreakpoint = 636;
  const customXsDownBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(customBreakpoint)
  );
  const customSmMdBetweenBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between(customBreakpoint, 'md')
  );

  return (
    <StyledLandingHeaderGrid
      container
      data-qa-entity-header
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacingBottom !== undefined ? `${spacingBottom}px` : 0,
        width: '100%',
      }}
    >
      <Grid
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: xsDown ? 'wrap' : 'nowrap',
          gap: 3,
          justifyContent: 'flex-end',
          flex: '1 1 auto',

          marginLeft: customSmMdBetweenBreakpoint
            ? theme.spacingFunction(16)
            : customXsDownBreakpoint
              ? theme.spacingFunction(8)
              : undefined,
        }}
      >
        {
          // @TODO (DPS-34192) Search input - both streams and destinations
        }
        <StyledActions>
          {
            // @TODO (DPS-34193) Select status - only streams
          }
          {onButtonClick && (
            <Button
              buttonType="primary"
              disabled={disabledCreateButton}
              loading={loading}
              onClick={onButtonClick}
              {...buttonDataAttrs}
            >
              {createButtonText ?? `Create ${entity}`}
            </Button>
          )}
        </StyledActions>
      </Grid>
    </StyledLandingHeaderGrid>
  );
};

const StyledActions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacingFunction(24),
  justifyContent: 'flex-end',
}));

const StyledLandingHeaderGrid = styled(Grid)(({ theme }) => ({
  '&:not(:first-of-type)': {
    marginTop: theme.spacingFunction(24),
  },
}));
