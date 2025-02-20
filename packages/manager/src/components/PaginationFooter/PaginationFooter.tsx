import { Box, TextField } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { MenuItem } from 'src/components/MenuItem';

import { PaginationControls } from '../PaginationControls/PaginationControls';

import type { SxProps } from '@mui/material/styles';

export const MIN_PAGE_SIZE = 25;

export interface PaginationProps {
  count: number;
  eventCategory?: string;
  fixedSize?: boolean;
  page: number;
  pageSize: number;
  showAll?: boolean;
  sx?: SxProps;
}

interface Props extends PaginationProps {
  handlePageChange: (page: number) => void;
  handleSizeChange: (pageSize: number) => void;
}

export const PAGE_SIZES = [MIN_PAGE_SIZE, 50, 75, 100, Infinity];

const baseOptions = [
  { label: 'Show 25', value: PAGE_SIZES[0] },
  { label: 'Show 50', value: PAGE_SIZES[1] },
  { label: 'Show 75', value: PAGE_SIZES[2] },
  { label: 'Show 100', value: PAGE_SIZES[3] },
];

export const PaginationFooter = (props: Props) => {
  const theme = useTheme();
  const {
    count,
    fixedSize,
    handlePageChange,
    handleSizeChange,
    page,
    pageSize,
    showAll,
    sx,
  } = props;

  if (count <= MIN_PAGE_SIZE && !fixedSize) {
    return null;
  }

  const finalOptions = [...baseOptions];

  // Add "Show All" to the list of options if the consumer has so specified.
  if (showAll) {
    finalOptions.push({ label: 'Show All', value: Infinity });
  }

  const defaultPagination = finalOptions.find((eachOption) => {
    return eachOption.value === pageSize;
  });

  // If "Show All" is currently selected, pageSize is `Infinity`.
  const isShowingAll = pageSize === Infinity;

  return (
    <Box
      sx={{
        background: theme.bg.bgPaper,
        border: `1px solid ${theme.tokens.table.Row.Border}`,
        borderTop: 0,
        ...sx,
      }}
      alignItems="center"
      data-qa-table-pagination
      display="flex"
      justifyContent="space-between"
    >
      {!isShowingAll && (
        <PaginationControls
          count={count}
          onClickHandler={handlePageChange}
          page={page}
          pageSize={pageSize}
        />
      )}
      {!fixedSize ? (
        <Box data-qa-pagination-page-size padding={0.5}>
          <StyledTextField
            SelectProps={{
              MenuProps: {
                disablePortal: true,
              },
            }}
            defaultValue={defaultPagination}
            hideLabel
            label="Number of items to show"
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            select
            value={pageSize}
          >
            {finalOptions.map((option) => (
              <MenuItem
                data-qa-pagination-page-size-option={option.value}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </StyledTextField>
        </Box>
      ) : null}
    </Box>
  );
};

const StyledTextField = styled(TextField, {
  label: 'StyledTextField',
})(({ theme }) => ({
  '& .MuiInput-root': {
    backgroundColor: theme.bg.bgPaper,
    border: '1px solid transparent',
  },
  '& .MuiList-root': {
    border: `1px solid ${theme.palette.primary.main}`,
  },
  '& .MuiSelect-select': {
    border: 'none',
  },
  '& .MuiSvgIcon-root': {
    margin: 0,
    padding: 0,
    position: 'relative',
    top: 0,
  },
  '&.Mui-focused': {
    border: `1px dotted ${theme.color.grey1}`,
    boxShadow: 'none',
  },
}));

/**
 * Return the minimum page size needed to display a given number of items (`value`).
 * Example: getMinimumPageSizeForNumberOfItems(30, [25, 50, 75]) === 50
 */
export const getMinimumPageSizeForNumberOfItems = (
  numberOfItems: number,
  pageSizes: number[] = PAGE_SIZES
) => {
  // Ensure the page sizes are sorted numerically.
  const sortedPageSizes = [...pageSizes].sort((a, b) => a - b);

  for (let i = 0; i < sortedPageSizes.length; i++) {
    if (numberOfItems <= sortedPageSizes[i]) {
      return sortedPageSizes[i];
    }
  }
  return Infinity;
};
