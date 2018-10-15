import * as classNames from 'classnames';
import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

import Button from 'src/components/Button';
import TableCell, { TableCellProps } from 'src/components/TableCell';

type ClassNames = 'root'
  | 'tableHead'
  | 'sortButton'
  | 'sortIcon';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  tableHead: {
    position: 'sticky',
    top: 72,
    backgroundColor: theme.bg.offWhite,
    zIndex: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sortButton: {
    marginLeft: -26,
    border: 0,
    width: '100%',
    justifyContent: 'flex-start',
  },
  sortIcon: {
    position: 'relative',
    top: 2,
    left: 10,
  },
});

interface Props extends TableCellProps {
  isActive: boolean;
  /* label must match the API filterable field name */
  label: string;
  order: 'asc' | 'desc';
  handleSorting: (key: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SortableTableCell: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    handleSorting,
    label,
    order,
    isActive,
    classes
  } = props;

  const handleClick = () => {
    const nextOrder = (order === 'asc')
      ? 'desc'
      : 'asc';
    return handleSorting(label.toLowerCase(), nextOrder);
  }

  const renderIcon = () => {
    return (
      props.order === 'desc'
        ? <KeyboardArrowUp className="sortIcon" />
        : <KeyboardArrowDown className="sortIcon" />
    );
  }

  return (
    <TableCell
      className={classNames({
        [classes.tableHead]: true,
      })}
      sortable
    >
      <Button
        type="secondary"
        value='label'
        className={classes.sortButton}
        onClick={handleClick}
        data-qa-stackscript-table-header
      >
        {label}
        {isActive &&
          renderIcon()
        }
      </Button>
    </TableCell>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SortableTableCell);
