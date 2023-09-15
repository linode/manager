import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from '../Box';
import Select from '../EnhancedSelect/Select';
import { PaginationControls } from '../PaginationControls/PaginationControls';

export const MIN_PAGE_SIZE = 25;

export interface PaginationProps {
  count: number;
  eventCategory?: string;
  fixedSize?: boolean;
  page: number;
  pageSize: number;
  showAll?: boolean;
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
      }}
      alignItems="center"
      display="flex"
      justifyContent="space-between"
      data-qa-table-pagination
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
        <PageSizeSelectContainer data-qa-pagination-page-size>
          <Select
            defaultValue={defaultPagination}
            hideLabel
            isClearable={false}
            label="Number of items to show"
            medium
            menuPlacement="top"
            noMarginTop
            onChange={({ value }) => handleSizeChange(value)}
            options={finalOptions}
          />
        </PageSizeSelectContainer>
      ) : null}
    </Box>
  );
};

const PageSizeSelectContainer = styled(Box, {
  label: 'PageSizeSelectContainer',
})(({ theme }) => ({
  '& .MuiInput-input': {
    paddingTop: 4,
  },
  '& .MuiInput-root': {
    '&.Mui-focused': {
      boxShadow: 'none',
    },
    backgroundColor: theme.bg.bgPaper,
    border: 'none',
  },
  '& .react-select__value-container': {
    paddingLeft: 12,
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
