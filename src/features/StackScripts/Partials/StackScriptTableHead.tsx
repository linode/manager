import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

type ClassNames =
  | 'root'
  | 'stackscriptLabel'
  | 'stackscriptTitles'
  | 'selectingStackscriptTitles'
  | 'deploys'
  | 'revisions'
  | 'tags'
  | 'actionMenu'
  | 'tr'
  | 'tableHead';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    stackscriptLabel: {},
    stackscriptTitles: {
      width: '60%',
      [theme.breakpoints.up('lg')]: {
        minWidth: 150
      }
    },
    selectingStackscriptTitles: {
      width: 'calc(100% - 65px)'
    },
    deploys: {
      width: '10%',
      [theme.breakpoints.up('lg')]: {
        width: '12%',
        minWidth: 140
      }
    },
    revisions: {
      width: '10%',
      [theme.breakpoints.up('lg')]: {
        width: '12%',
        minWidth: 150
      }
    },
    tags: {
      width: '10%',
      [theme.breakpoints.up('lg')]: {
        width: '12%',
        minWidth: 100
      }
    },
    actionMenu: {
      width: '10%',
      [theme.breakpoints.up('lg')]: {
        width: 65
      }
    },
    tr: {
      height: 48
    },
    tableHead: {
      top: theme.spacing(11)
    }
  });

type SortOrder = 'asc' | 'desc';

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface Props {
  isSelecting?: boolean;
  handleClickTableHeader?: (value: string) => void;
  sortOrder?: SortOrder;
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

    const Cell: React.ComponentType<any> =
      !!handleClickTableHeader && sortOrder ? TableSortCell : TableCell;

    const maybeAddSortingProps = (orderBy: string) =>
      !!handleClickTableHeader && sortOrder
        ? {
            direction: sortOrder,
            active: currentFilterType === orderBy,
            label: orderBy,
            handleClick: handleClickTableHeader
          }
        : {};

    return (
      <TableHead>
        <TableRow className={classes.tr}>
          {!!isSelecting && (
            <TableCell
              className={classNames({
                [classes.tableHead]: true,
                [classes.stackscriptLabel]: true
              })}
            />
          )}
          <Cell
            className={classNames({
              [classes.tableHead]: true,
              [classes.stackscriptTitles]: true,
              [classes.selectingStackscriptTitles]: isSelecting
            })}
            data-qa-stackscript-table-header
            {...maybeAddSortingProps('label')}
          >
            StackScript
          </Cell>
          {!isSelecting && (
            <Cell
              className={classNames({
                [classes.tableHead]: true,
                [classes.deploys]: true
              })}
              data-qa-stackscript-active-deploy-header
              {...maybeAddSortingProps('deploys')}
            >
              Active Deploys
            </Cell>
          )}
          {!isSelecting && (
            <Cell
              className={classNames({
                [classes.tableHead]: true,
                [classes.revisions]: true
              })}
              data-qa-stackscript-revision-header
              {...maybeAddSortingProps('revision')}
            >
              Last Revision
            </Cell>
          )}
          {!isSelecting && (
            <TableCell
              className={classNames({
                [classes.tableHead]: true,
                [classes.tags]: true
              })}
              data-qa-stackscript-compatible-images
            >
              Compatible Images
            </TableCell>
          )}
          {!isSelecting && (
            <TableCell
              className={classNames({
                [classes.tableHead]: true,
                [classes.stackscriptLabel]: true
              })}
            />
          )}
        </TableRow>
      </TableHead>
    );
  }
}

const styled = withStyles(styles);

export default styled(StackScriptTableHead);
