import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import NodePoolTableContent, {
  Props as TableContentProps
} from './NodePoolTableContent';

type ClassNames = 'root' | 'small';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      border: `1px solid ${theme.palette.divider}`,
      borderBottom: 0,
      '& .data': {
        [theme.breakpoints.only('sm')]: {
          marginLeft: theme.spacing(1),
          textAlign: 'right'
        }
      }
    },
    small: {
      maxWidth: '50%'
    }
  });

interface Props extends TableContentProps {
  small?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const NodePoolDisplayTable: React.FunctionComponent<CombinedProps> = props => {
  const { classes, small, ...rest } = props;

  return (
    <Table
      tableClass={classNames({
        [classes.root]: true,
        [classes.small]: small
      })}
      spacingTop={16}
    >
      <TableHead>
        <TableRow>
          <TableCell data-qa-table-header="Plan">Plan</TableCell>
          <TableCell data-qa-table-header="Node Count">Node Count</TableCell>
          <TableCell data-qa-table-header="Pricing">Pricing</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        <NodePoolTableContent {...rest} />
      </TableBody>
    </Table>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(React.memo, styled);

export default enhanced(NodePoolDisplayTable);
