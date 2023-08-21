import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Checkbox } from 'src/components/Checkbox';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';

// import { StyledCheckbox, StyledEmptyCheckbox } from './TransferTable.styles';

const useStyles = makeStyles((theme: Theme) => ({
  check: {
    '& svg': {
      height: 20,
      width: 20,
    },
  },
  checkEmpty: {
    '& svg': { color: '#cccccc' },
  },
  footer: {
    marginBottom: theme.spacing(),
    padding: theme.spacing(),
  },
  root: {
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(2),
  },
  search: {
    marginBottom: theme.spacing(0.5),
    maxWidth: 556,
  },
  table: {
    '& thead': {
      '& th': {
        '&:first-of-type': {
          borderLeft: 'none',
          paddingLeft: 0,
          paddingRight: 0,
        },
        '&:last-of-type': {
          borderRight: 'none',
        },
        backgroundColor: theme.bg.tableHeader,
        borderBottom: `2px solid ${theme.borderColors.borderTable}`,
        borderLeft: `1px solid ${theme.borderColors.borderTable}`,
        borderRight: `1px solid ${theme.borderColors.borderTable}`,
        borderTop: `2px solid ${theme.borderColors.borderTable}`,
        color: theme.textColors.tableHeader,
        fontFamily: theme.font.bold,
        fontSize: '0.875em !important',
        padding: '0px 15px',
      },
    },
    marginTop: theme.spacing(),
  },
}));

export interface Props {
  children: JSX.Element;
  count: number;
  handleSearch: (searchText: string) => void;
  hasSelectedAll: boolean;
  headers: string[];
  page: number;
  pageSize: number;
  requestPage: (page: number) => void;
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
    toggleSelectAll,
  } = props;
  const classes = useStyles();

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    return toggleSelectAll(e.target.checked);
  };

  return (
    <>
      <Typography className={classes.root} variant="h2">
        Linodes
      </Typography>
      <DebouncedSearchTextField
        className={classes.search}
        debounceTime={400}
        hideLabel
        isSearching={false}
        label="Search by label"
        onSearch={handleSearch}
        placeholder="Search by label"
      />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell style={{ textAlign: 'center', width: 50 }}>
              <Checkbox
                className={`${classes.check} ${
                  hasSelectedAll ? '' : classes.checkEmpty
                }`}
                inputProps={{
                  'aria-label': `Select all services on page`,
                }}
                checked={hasSelectedAll}
                onChange={handleToggleAll}
              />
            </TableCell>
            {headers.map((thisHeader) => (
              <TableCell key={`entity-table-header-${thisHeader}`}>
                {thisHeader}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{props.children}</TableBody>
      </Table>
      {count > pageSize ? (
        <PaginationFooter
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
