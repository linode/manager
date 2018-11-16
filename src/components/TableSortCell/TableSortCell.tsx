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

export default styled(TableSortCell);
