import { Autocomplete, Button } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';

import type { Theme } from '@mui/material/styles';
import type { LabelValueOption } from 'src/features/Delivery/Shared/types';

export interface DeliveryTabHeaderProps {
  buttonDataAttrs?: { [key: string]: boolean | string };
  createButtonText?: string;
  disabledCreateButton?: boolean;
  entity?: string;
  isSearching?: boolean;
  loading?: boolean;
  onButtonClick?: () => void;
  onSearch?: (label: string) => void;
  onSelect?: (status: string) => void;
  searchValue?: string;
  selectList?: LabelValueOption[];
  selectValue?: string;
  spacingBottom?: 0 | 4 | 16 | 24;
}

export const DeliveryTabHeader = ({
  buttonDataAttrs,
  createButtonText,
  disabledCreateButton,
  entity,
  loading,
  onButtonClick,
  spacingBottom = 24,
  isSearching,
  selectList,
  onSelect,
  selectValue,
  searchValue,
  onSearch,
}: DeliveryTabHeaderProps) => {
  const theme = useTheme();

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const customBreakpoint = 636;
  const customXsDownBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(customBreakpoint)
  );
  const customSmMdBetweenBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between(customBreakpoint, 'md')
  );
  const searchLabel = `Search for a ${entity}`;

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
          justifyContent:
            onSearch && searchValue !== undefined
              ? 'space-between'
              : 'flex-end',
          flex: '1 1 auto',

          marginLeft: customSmMdBetweenBreakpoint
            ? theme.spacingFunction(16)
            : customXsDownBreakpoint
              ? theme.spacingFunction(8)
              : undefined,
          marginRight: customSmMdBetweenBreakpoint
            ? theme.spacingFunction(16)
            : customXsDownBreakpoint
              ? theme.spacingFunction(8)
              : undefined,
        }}
      >
        {onSearch && searchValue !== undefined && (
          <DebouncedSearchTextField
            clearable
            hideLabel
            isSearching={isSearching}
            label={searchLabel}
            onSearch={onSearch}
            placeholder={searchLabel}
            value={searchValue}
          />
        )}
        <StyledActions>
          {selectList && onSelect && (
            <Autocomplete
              label={'Status'}
              noMarginTop
              onChange={(_, option) => {
                onSelect(option?.value ?? '');
              }}
              options={selectList}
              placeholder="Select"
              value={selectList.find(({ value }) => value === selectValue)}
            />
          )}
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
  marginLeft: 'auto',

  '& .MuiAutocomplete-root > .MuiBox-root': {
    display: 'flex',

    '& > .MuiBox-root': {
      margin: '0',

      '& > .MuiInputLabel-root': {
        margin: 0,
        marginRight: theme.spacingFunction(12),
      },
    },
  },
}));

const StyledLandingHeaderGrid = styled(Grid)(({ theme }) => ({
  '&:not(:first-of-type)': {
    marginTop: theme.spacingFunction(24),
  },

  [theme.breakpoints.up('sm')]: {
    '& .MuiFormControl-fullWidth': {
      width: '180px',
    },
  },

  [theme.breakpoints.up('md')]: {
    '& .MuiFormControl-fullWidth': {
      width: '235px',
    },
  },

  [theme.breakpoints.up('lg')]: {
    '& .MuiFormControl-fullWidth': {
      width: '270px',
    },
  },
}));
