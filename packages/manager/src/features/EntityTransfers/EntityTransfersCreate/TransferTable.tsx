import * as React from 'react';
import Table from 'src/components/Table/Table_CMR';
import TableHead from 'src/components/core/TableHead';
import TableBody from 'src/components/core/TableBody';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import CheckBox from 'src/components/CheckBox';
import PaginationFooter from 'src/components/PaginationFooter';
import DebouncedSearchTextField from 'src/components/DebouncedSearchTextField';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing()
  },
  search: {
    marginBottom: theme.spacing() / 2,
    maxWidth: 556
  },
  table: {
    marginTop: theme.spacing(),
    '& thead': {
      '& th': {
        backgroundColor: theme.cmrBGColors.bgTableHeader,
        borderTop: `2px solid ${theme.cmrBorderColors.borderTable}`,
        borderRight: `1px solid ${theme.cmrBorderColors.borderTable}`,
        borderBottom: `2px solid ${theme.cmrBorderColors.borderTable}`,
        borderLeft: `1px solid ${theme.cmrBorderColors.borderTable}`,
        fontFamily: theme.font.bold,
        fontSize: '0.875em !important',
        color: theme.cmrTextColors.tableHeader,
        padding: '0px 15px',
        '&:first-of-type': {
          borderLeft: 'none',
          paddingLeft: 0,
          paddingRight: 0
        },
        '&:last-of-type': {
          borderRight: 'none'
        }
      }
    }
  },
  check: {
    '& svg': {
      width: 20,
      height: 20
    }
  },
  checkEmpty: {
    '& svg': { color: '#cccccc' }
  },
  footer: {
    padding: theme.spacing(),
    marginBottom: theme.spacing()
  }
}));

export interface Props {
  count: number;
  page: number;
  pageSize: number;
  headers: string[];
  hasSelectedAll: boolean;
  requestPage: (page: number) => void;
  handleSearch: (searchText: string) => void;
  toggleSelectAll: (isToggled: boolean) => void;
  children: JSX.Element;
}

export const TransferTable: React.FC<Props> = props => {
  const {
    count,
    hasSelectedAll,
    headers,
    page,
    pageSize,
    handleSearch,
    requestPage,
    toggleSelectAll
  } = props;
  const classes = useStyles();

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    return toggleSelectAll(e.target.checked);
  };

  return (
    <>
      <Typography variant="h2" className={classes.root}>
        Linodes
      </Typography>
      <DebouncedSearchTextField
        className={classes.search}
        placeholder="Search by label"
        debounceTime={400}
        onSearch={handleSearch}
        isSearching={false}
        label="Search by label"
        hideLabel
      />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: 50, textAlign: 'center' }}>
              <CheckBox
                className={`${classes.check} ${
                  hasSelectedAll ? '' : classes.checkEmpty
                }`}
                checked={hasSelectedAll}
                onChange={handleToggleAll}
                inputProps={{
                  'aria-label': `Select all entities on page`
                }}
              />
            </TableCell>
            {headers.map(thisHeader => (
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
          handlePageChange={requestPage}
          handleSizeChange={() => null} // Transfer tables are going to be sticky at 25
          page={page}
          pageSize={pageSize}
          eventCategory="Entity Transfer Table"
          fixedSize
        />
      ) : null}
    </>
  );
};

export default React.memo(TransferTable);
