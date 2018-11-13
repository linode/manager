import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';

import TableHead from '@material-ui/core/TableHead';

import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  sortOrder: 'asc' | 'desc';
  handleClick: () => void;
  currentFilter?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TableHeader: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    sortOrder,
    handleClick,
    currentFilter
  } = props;

  return (
    <TableHead>
      <TableRow>
        <TableSortCell
          direction={sortOrder}
          active={currentFilter === 'label'}
          label="label"
          handleClick={handleClick}
          data-qa-stackscript-table-header
        >
          StackScript
        </TableSortCell>
        <TableSortCell
          direction={sortOrder}
          active={currentFilter === 'deploys'}
          label="deploys"
          handleClick={handleClick}
          data-qa-stackscript-active-deploy-header
        >
          Active Deploys
        </TableSortCell>
        <TableSortCell
          direction={sortOrder}
          active={currentFilter === 'revision'}
          label="revision"
          handleClick={handleClick}
          data-qa-stackscript-revision-header
        >
          Last Revision
        </TableSortCell>
        <TableCell data-qa-stackscript-compatible-images>
          Compatible Images
        </TableCell>
        {/** empty cell to account for kebab menu */}
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(TableHeader);
