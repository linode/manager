import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableHead from '@material-ui/core/TableHead';

import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

import Button from 'src/components/Button';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

type ClassNames = 'root'
  | 'stackscriptLabel'
  | 'stackscriptTitles'
  | 'deploys'
  | 'revisions'
  | 'tr'
  | 'tableHead'
  | 'sortButton'
  | 'sortIcon';

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

type SortOrder = 'asc' | 'desc';

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface Props {
  isSelecting?: boolean;
  handleClickTableHeader: (e: React.MouseEvent<HTMLElement>) => void;
  sortOrder: SortOrder;
  currentFilterType: CurrentFilter | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class StackScriptTableHead extends React.Component<CombinedProps, {}> {
  renderIcon = () => {
    const { sortOrder } = this.props;

    return (
      sortOrder === 'desc'
        ? <KeyboardArrowUp className="sortIcon" />
        : <KeyboardArrowDown className="sortIcon" />
    );
  }

  render() {
    const {
      classes,
      currentFilterType,
      isSelecting,
      handleClickTableHeader,
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
          <TableCell
            className={classNames({
              [classes.tableHead]: true,
              [classes.stackscriptTitles]: true,
            })}
            sortable
          >
            <Button
              type="secondary"
              value='label'
              className={classes.sortButton}
              onClick={handleClickTableHeader}
              data-qa-stackscript-table-header
            >
              StackScript
        {currentFilterType === 'label' &&
                this.renderIcon()
              }
            </Button>
          </TableCell>
          <TableCell
            className={classNames({
              [classes.tableHead]: true,
              [classes.deploys]: true,
            })}
            noWrap
            sortable
          >
            <Button
              type="secondary"
              value='deploys'
              className={classes.sortButton}
              onClick={handleClickTableHeader}
              data-qa-stackscript-active-deploy-header
            >
              Active Deploys
        {currentFilterType !== 'label' && currentFilterType !== 'revision' &&
                this.renderIcon()
              }
            </Button>
          </TableCell>
          <TableCell
            className={classNames({
              [classes.tableHead]: true,
              [classes.revisions]: true,
            })}
            noWrap
            sortable
          >
            <Button
              type="secondary"
              value='revision'
              className={classes.sortButton}
              onClick={handleClickTableHeader}
              data-qa-stackscript-revision-header
            >
              Last Revision
        {currentFilterType === 'revision' &&
                this.renderIcon()
              }
            </Button>
          </TableCell>
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
