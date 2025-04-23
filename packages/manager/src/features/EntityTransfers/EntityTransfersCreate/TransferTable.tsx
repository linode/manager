import { Checkbox } from '@linode/ui';
import * as React from 'react';

import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import {
  StyledCheckAllTableCell,
  StyledDebouncedSearchTextField,
  StyledPaginationFooter,
  StyledTable,
  StyledTypography,
} from './TransferTable.styles';

export interface Props {
  children: JSX.Element;
  count: number;
  handleSearch: (searchText: string) => void;
  hasSelectedAll: boolean;
  headers: string[];
  page: number;
  pageSize: number;
  requestPage: (page: number) => void;
  searchText: string;
  toggleSelectAll: (isToggled: boolean) => void;
}

export const TransferTable = React.memo((props: Props) => {
  const {
    count,
    handleSearch,
    hasSelectedAll,
    headers,
    page,
    pageSize,
    requestPage,
    searchText,
    toggleSelectAll,
  } = props;

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    return toggleSelectAll(e.target.checked);
  };

  return (
    <>
      <StyledTypography variant="h2">Linodes</StyledTypography>
      <StyledDebouncedSearchTextField
        debounceTime={400}
        hideLabel
        isSearching={false}
        label="Search by label"
        onSearch={handleSearch}
        placeholder="Search by label"
        value={searchText}
      />
      <StyledTable>
        <TableHead>
          <TableRow>
            <StyledCheckAllTableCell>
              <Checkbox
                checked={hasSelectedAll}
                inputProps={{
                  'aria-label': `Select all services on page`,
                }}
                onChange={handleToggleAll}
                size="small"
              />
            </StyledCheckAllTableCell>
            {headers.map((thisHeader) => (
              <TableCell key={`entity-table-header-${thisHeader}`}>
                {thisHeader}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{props.children}</TableBody>
      </StyledTable>
      {count > pageSize ? (
        <StyledPaginationFooter
          count={count}
          eventCategory="Service Transfer Table"
          fixedSize
          handlePageChange={requestPage}
          handleSizeChange={() => null} // Transfer tables are going to be sticky at 25
          page={page}
          pageSize={pageSize}
        />
      ) : null}
    </>
  );
});
