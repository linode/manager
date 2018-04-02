import * as React from 'react';

import Select from 'material-ui/Select';
import MenuItem from 'material-ui/Menu/MenuItem';
import Grid from 'src/components/Grid';

import PaginationControls from '../PaginationControls';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';

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
  handleSizeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
