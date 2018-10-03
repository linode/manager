import * as React from 'react';

import * as classNames from 'classnames';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Grid from 'src/components/Grid';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';

import PaginationControls from '../PaginationControls';

type ClassNames = 'root' | 'padded';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  return ({
    root: {
      marginTop: theme.spacing.unit,
    },
    padded: {
      padding: `0 ${theme.spacing.unit * 2}px ${theme.spacing.unit}px`,
    },
  });
};

export interface PaginationProps {
  count: number;
  page: number;
  pageSize: number;
}

interface Props extends PaginationProps {
  handlePageChange: (page: number) => void;
  handleSizeChange: (pageSize: number) => void;
  padded?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class PaginationFooter extends React.PureComponent<CombinedProps> {

  handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => this.props.handleSizeChange(+e.target.value);

  render() {
    const { classes, count, page, pageSize, handlePageChange, padded } = this.props;

    if (count <= 25) { return null; }

    return (
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classNames({
          [classes.root]: true,
          [classes.padded]: padded,
        })}>
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
            onChange={this.handleSizeChange}
            disableUnderline
            pagination
          >
            <MenuItem value={25}>Show 25</MenuItem>
            <MenuItem value={50}>Show 50</MenuItem>
            <MenuItem value={75}>Show 75</MenuItem>
            <MenuItem value={100}>Show 100</MenuItem>
          </Select>
        </Grid>
      </Grid>
    );
  }
}


export default withStyles(styles, { withTheme: true })(PaginationFooter);
