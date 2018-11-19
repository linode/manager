import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableCell, { TableCellProps } from 'src/components/core/TableCell';
import TableSortLabel from 'src/components/core/TableSortLabel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {}
});

interface Props extends TableCellProps {
  active: boolean;
  label: string;
  direction: 'asc' | 'desc';
  handleClick: (key: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TableSortCell extends React.PureComponent<CombinedProps, {}> {

  handleClick = () => {
    const { label, direction, handleClick } = this.props;
    const nextOrder = (direction === 'asc')
      ? 'desc'
      : 'asc';
    return handleClick(label.toLowerCase(), nextOrder);
  }

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
}

const styled = withStyles(styles);

export default styled(TableSortCell);
