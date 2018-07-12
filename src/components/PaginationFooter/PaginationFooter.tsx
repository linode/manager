import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Grid from 'src/components/Grid';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';

import PaginationControls from '../PaginationControls';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => {
  return ({
    root: {
      marginTop: theme.spacing.unit,
    },
  });
};

interface Props {
  handlePageChange: (page: number) => void;
  handleSizeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  pageSize: number;
  pages: number | number[];
  page: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const PaginationFooter: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    handlePageChange,
    handleSizeChange,
    pageSize,
    pages,
    page,
    classes,
  } = props;

  return (
    <Grid
      container
      justify="space-between"
      alignItems="center"
      className={classes.root}>
      <Grid item>
        <PaginationControls
          onClickHandler={handlePageChange}
          pages={pages}
          currentPage={page}
          range={5}
        />
      </Grid>
      <Grid item>
        <Select
          value={pageSize}
          onChange={handleSizeChange}
          disableUnderline
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

export default withStyles(styles, { withTheme: true })(PaginationFooter);
