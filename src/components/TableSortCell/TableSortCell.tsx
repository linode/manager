import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableCell, { TableCellProps } from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

type ClassNames = 'sortButton' | 'sortIcon';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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
  active: boolean;
  label: string;
  direction: 'asc' | 'desc';
  handleClick: (v: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TableSortCell extends React.PureComponent<CombinedProps, {}> {
  render() {
    const { classes, children, direction, label, active, handleClick, ...rest } = this.props;

    return (
      <TableCell {...rest}>
        <TableSortLabel
          active={active}
          direction={direction}
          onClick={this.handleClick}
        >
          {children}
        </TableSortLabel>
      </TableCell>
    );
  }

  handleClick = (v: React.MouseEvent<HTMLElement>) => this.props.handleClick(this.props.label);
}

const styled = withStyles(styles, { withTheme: true });

export default styled<CombinedProps>(TableSortCell);
