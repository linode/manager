import * as classNames from 'classnames';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import PaginationControls from '../PaginationControls';

type ClassNames = 'root' | 'padded';

const styles: StyleRulesCallback<ClassNames> = theme => {
  return {
    root: {
      marginTop: theme.spacing(1)
    },
    padded: {
      padding: `0 ${theme.spacing(2)}px ${theme.spacing(1)}px`
    }
  };
};

export interface PaginationProps {
  count: number;
  page: number;
  pageSize: number;
  eventCategory: string;
}

interface Props extends PaginationProps {
  handlePageChange: (page: number) => void;
  handleSizeChange: (pageSize: number) => void;
  padded?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const options = [
  { label: 'Show 25', value: 25 },
  { label: 'Show 50', value: 50 },
  { label: 'Show 75', value: 75 },
  { label: 'Show 100', value: 100 }
];

class PaginationFooter extends React.PureComponent<CombinedProps> {
  handleSizeChange = (e: Item) => this.props.handleSizeChange(+e.value);

  render() {
    const {
      classes,
      count,
      page,
      pageSize,
      handlePageChange,
      padded,
      eventCategory
    } = this.props;

    if (count <= 25) {
      return null;
    }

    const defaultPagination = options.find(eachOption => {
      return eachOption.value === pageSize;
    });

    return (
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classNames({
          [classes.root]: true,
          [classes.padded]: padded
        })}
      >
        <Grid item>
          <PaginationControls
            onClickHandler={handlePageChange}
            page={page}
            count={count}
            pageSize={pageSize}
            eventCategory={eventCategory}
          />
        </Grid>
        <Grid item>
          <Select
            options={options}
            defaultValue={defaultPagination}
            onChange={this.handleSizeChange}
            isClearable={false}
            noMarginTop
            menuPlacement="top"
            medium
          />
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(PaginationFooter);
