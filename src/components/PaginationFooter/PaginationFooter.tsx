import * as React from 'react';

import Select from 'material-ui/Select';
import MenuItem from 'material-ui/Menu/MenuItem';
import Grid from 'material-ui/Grid';

import PaginationControls from '../PaginationControls';

interface Props {
  handlePageChange: (page: number) => void;
  handleSizeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pageSize: number;
  pages: number | number[];
  page: number;
}

const PaginationFooter: React.StatelessComponent<Props> = (props) => {
  const {
    handlePageChange,
    handleSizeChange,
    pageSize,
    pages,
    page,
  } = props;

  return (
    <Grid container>
      <Grid item xs={12} md={6}>
        <PaginationControls
          onClickHandler={handlePageChange}
          pages={pages}
          currentPage={page}
          range={5}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Select
          value={pageSize}
          onChange={handleSizeChange}
        >
          <MenuItem value={25}>Show 25</MenuItem>
          <MenuItem value={50}>Show 50</MenuItem>
          <MenuItem value={75}>Show 75</MenuItem>
          <MenuItem value={100}>Show 100</MenuItem>
        </Select>
      </Grid>
    </Grid>
  );
};


export default PaginationFooter;
