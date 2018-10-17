import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableHead from '@material-ui/core/TableHead';

import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

type ClassNames = 'root'
  | 'stackscriptLabel'
  | 'stackscriptTitles'
  | 'deploys'
  | 'revisions'
  | 'tr'
  | 'tableHead';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  stackscriptLabel: {
    width: 84,
  },
  stackscriptTitles: {
    width: '30%',
    minWidth: 200,
  },
  deploys: {
    width: '20%',
    minWidth: 200,
  },
  revisions: {
    width: '20%',
    minWidth: 200,
  },
  tr: {
    height: 48,
  },
  tableHead: {
    position: 'sticky',
    top: 72,
    backgroundColor: theme.bg.offWhite,
    zIndex: 10,
    paddingTop: 0,
    paddingBottom: 0,
    height: 48,
  },
});

type SortOrder = 'asc' | 'desc';

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface Props {
  isSelecting?: boolean;
  handleClickTableHeader: (value: string) => void;
  sortOrder: SortOrder;
  currentFilterType: CurrentFilter | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class StackScriptTableHead extends React.Component<CombinedProps, {}> {
  render() {
    const {
      classes,
      currentFilterType,
      isSelecting,
      handleClickTableHeader,
      sortOrder
    } = this.props;

    return (
      <TableHead>
        <TableRow className={classes.tr}>
          {!!isSelecting &&
            <TableCell
              className={classNames({
                [classes.tableHead]: true,
                [classes.stackscriptLabel]: true,
              })} />
          }
          <TableSortCell
            className={classNames({
              [classes.tableHead]: true,
              [classes.stackscriptTitles]: true,
            })}
            direction={sortOrder}
            active={currentFilterType === 'label'}
            label="label"
            handleClick={handleClickTableHeader}
          >
            StackScript
          </TableSortCell>
          <TableSortCell
            className={classNames({
              [classes.tableHead]: true,
              [classes.deploys]: true,
            })}
            direction={sortOrder}
            active={currentFilterType === 'deploys'}
            label="deploys"
            handleClick={handleClickTableHeader}
          >
            Active Deploys
          </TableSortCell>
          <TableSortCell
            className={classNames({
              [classes.tableHead]: true,
              [classes.revisions]: true,
            })}
            direction={sortOrder}
            active={currentFilterType === 'revision'}
            label="revision"
            handleClick={handleClickTableHeader}
          >
            Last Revision
          </TableSortCell>
          <TableCell
            className={classes.tableHead}
            data-qa-stackscript-compatible-images
          >
            Compatible Images
    </TableCell>
          {!isSelecting &&
            <TableCell
              className={classNames({
                [classes.tableHead]: true,
                [classes.stackscriptLabel]: true,
              })} />
          }
        </TableRow>
      </TableHead>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(StackScriptTableHead);
