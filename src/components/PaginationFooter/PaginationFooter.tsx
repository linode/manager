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
  count: number;
  page: number;
  pageSize: number;
  handlePageChange: (page: number) => void;
  handleSizeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const PaginationFooter: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    count,
    page,
    pageSize,
    handlePageChange,
    handleSizeChange,
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
          page={page}
          count={count}
          pageSize={pageSize}
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
