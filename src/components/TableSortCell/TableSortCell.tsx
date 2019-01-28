import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableCell, { TableCellProps } from 'src/components/core/TableCell';
import TableSortLabel from 'src/components/core/TableSortLabel';

import Sort from 'src/assets/icons/sort.svg';
import SortUp from 'src/assets/icons/sortUp.svg';

type ClassNames = 'root' | 'intialIcon' | 'noWrap';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    color: theme.palette.text.primary
  },
  intialIcon: {
    margin: '2px 4px 0 4px'
  },
  noWrap: {
    whiteSpace: 'nowrap'
  }
});

interface Props extends TableCellProps {
  active: boolean;
  isLoading?: boolean;
  label: string;
  direction: 'asc' | 'desc';
  handleClick: (key: string, order?: 'asc' | 'desc') => void;
  noWrap?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TableSortCell extends React.PureComponent<CombinedProps, {}> {
  handleClick = () => {
    const { label, direction, handleClick } = this.props;
    const nextOrder = direction === 'asc' ? 'desc' : 'asc';
    return handleClick(label, nextOrder);
  };

  render() {
    const {
      classes,
      children,
      direction,
      label,
      active,
      handleClick,
      noWrap,
      isLoading,
      ...rest
    } = this.props;

    return (
      <TableCell className={noWrap ? `${classes.noWrap}` : ''} {...rest}>
        <TableSortLabel
          active={active}
          direction={direction}
          onClick={this.handleClick}
          className={classes.root}
          IconComponent={SortUp}
          hideSortIcon={true}
        >
          {children}
          {!active && <Sort className={classes.intialIcon} />}
        </TableSortLabel>
        {isLoading && <CircleProgress mini sort />}
      </TableCell>
    );
  }
}

const styled = withStyles(styles);

export default styled(TableSortCell);
