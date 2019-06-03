import {
  createStyles,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import * as React from 'react';

import TableHead from '@material-ui/core/TableHead';

import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

type ClassNames = 'root' | 'activeDeploys' | 'lastRevision';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  activeDeploys: {
    minWidth: 140
  },
  lastRevision: {
    minWidth: 130
  }
});

interface Props {
  sortOrder: 'asc' | 'desc';
  handleClick: (v: string) => void;
  currentFilter?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TableHeader: React.StatelessComponent<CombinedProps> = props => {
  const { sortOrder, handleClick, currentFilter, classes } = props;

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
          active={currentFilter === 'deployments_active'}
          label="deployments_active"
          handleClick={handleClick}
          data-qa-stackscript-active-deploy-header
          className={classes.activeDeploys}
        >
          Active Deploys
        </TableSortCell>
        <TableSortCell
          direction={sortOrder}
          active={currentFilter === 'updated'}
          label="updated"
          handleClick={handleClick}
          data-qa-stackscript-revision-header
          className={classes.lastRevision}
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

const styled = withStyles(styles);

export default styled(TableHeader);
