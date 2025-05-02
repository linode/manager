import { Box, Select } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { PaginationControls } from '../PaginationControls/PaginationControls';
import { MIN_PAGE_SIZE, PAGE_SIZES } from './PaginationFooter.constants';

import type { SxProps } from '@mui/material/styles';

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
      alignItems="center"
      data-qa-table-pagination
      display="flex"
      justifyContent="space-between"
      sx={{
        background: theme.bg.bgPaper,
        border: `1px solid ${theme.tokens.component.Table.Row.Border}`,
        borderTop: 0,
        ...sx,
      }}
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
          <Select
            hideLabel
            label="Number of items to show"
            listItemProps={(value) => {
              return {
                dataAttributes: {
                  'data-qa-pagination-page-size-option': String(value.value),
                },
              };
            }}
            onChange={(_e, value) => handleSizeChange(Number(value.value))}
            options={finalOptions}
            value={{
              label: defaultPagination?.label ?? '',
              value: defaultPagination?.value ?? '',
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
};
