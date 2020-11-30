import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import PaginationControls from '../PaginationControls';

export const MIN_PAGE_SIZE = 25;

type ClassNames = 'root' | 'padded';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(1)
    },
    padded: {
      padding: `0 ${theme.spacing(2)}px ${theme.spacing(1)}px`
    }
  });

export interface PaginationProps {
  count: number;
  page: number;
  pageSize: number;
  eventCategory: string;
  showAll?: boolean;
  fixedSize?: boolean;
}

interface Props extends PaginationProps {
  handlePageChange: (page: number) => void;
  handleSizeChange: (pageSize: number) => void;
  padded?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const PAGE_SIZES = [MIN_PAGE_SIZE, 50, 75, 100, Infinity];

const baseOptions = [
  { label: 'Show 25', value: PAGE_SIZES[0] },
  { label: 'Show 50', value: PAGE_SIZES[1] },
  { label: 'Show 75', value: PAGE_SIZES[2] },
  { label: 'Show 100', value: PAGE_SIZES[3] }
];

class PaginationFooter extends React.PureComponent<CombinedProps> {
  handleSizeChange = (e: Item) => this.props.handleSizeChange(+e.value);

  render() {
    const {
      classes,
      count,
      fixedSize,
      page,
      pageSize,
      handlePageChange,
      padded,
      eventCategory,
      showAll
    } = this.props;

    if (count <= MIN_PAGE_SIZE && !fixedSize) {
      return null;
    }

    const finalOptions = [...baseOptions];
    // Add "Show All" to the list of options if the consumer has so specified.
    if (showAll) {
      finalOptions.push({ label: 'Show All', value: Infinity });
    }

    const defaultPagination = finalOptions.find(eachOption => {
      return eachOption.value === pageSize;
    });

    // If "Show All" is currently selected, pageSize is `Infinity`.
    const isShowingAll = pageSize === Infinity;

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
          {!isShowingAll && (
            <PaginationControls
              onClickHandler={handlePageChange}
              page={page}
              count={count}
              pageSize={pageSize}
              eventCategory={eventCategory}
            />
          )}
        </Grid>
        {!fixedSize ? (
          <Grid item>
            <Select
              options={finalOptions}
              defaultValue={defaultPagination}
              onChange={this.handleSizeChange}
              label="Number of items to show"
              hideLabel
              isClearable={false}
              noMarginTop
              menuPlacement="top"
              medium
            />
          </Grid>
        ) : null}
      </Grid>
    );
  }
}

export default withStyles(styles)(PaginationFooter);

// =============================================================================
// Utilities
// =============================================================================

/**
 * Return the minimum page size needed to display a given number of items (`value`).
 * Example: getMinimumPageSizeForNumberOfItems(30, [25, 50, 75]) === 50
 */
export const getMinimumPageSizeForNumberOfItems = (
  numberOfItems: number,
  pageSizes: number[] = PAGE_SIZES
) => {
  // Ensure the page sizes are sorted numerically.
  const sortedPageSizes = [...pageSizes].sort((a, b) => a - b);

  for (let i = 0; i < sortedPageSizes.length; i++) {
    if (numberOfItems <= sortedPageSizes[i]) {
      return sortedPageSizes[i];
    }
  }
  return Infinity;
};
