import * as React from 'react';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import GridView from 'src/assets/icons/grid-view.svg';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  controlHeader: {
    backgroundColor: theme.bg.controlHeader,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  toggleButton: {
    padding: '0 10px',
    '&:focus': {
      // Browser default until we get styling direction for focus states
      outline: '1px dotted #999'
    }
  }
}));

interface Props {
  toggleLinodeView: () => 'list' | 'grid';
  linodeViewPreference: 'list' | 'grid';
  toggleGroupLinodes: () => boolean;
  linodesAreGrouped: boolean;
}

type CombinedProps = Props & Omit<OrderByProps, 'data'>;

const SortableTableHead: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    handleOrderChange,
    order,
    orderBy,
    toggleLinodeView,
    linodeViewPreference,
    toggleGroupLinodes,
    linodesAreGrouped
  } = props;

  const isActive = (label: string) =>
    label.toLowerCase() === orderBy.toLowerCase();

  return (
    <TableHead role="rowgroup" data-qa-table-head>
      <TableRow>
        <TableSortCell
          label="label"
          direction={order}
          active={isActive('label')}
          handleClick={handleOrderChange}
          data-qa-sort-label={order}
        >
          Label
        </TableSortCell>
        <TableSortCell
          noWrap
          label="_statusPriority"
          direction={order}
          active={isActive('_statusPriority')}
          handleClick={handleOrderChange}
        >
          Status
        </TableSortCell>
        <Hidden xsDown>
          <TableSortCell
            label="ipv4[0]" // we want to sort by the first ipv4
            active={isActive('ipv4[0]')}
            handleClick={handleOrderChange}
            direction={order}
          >
            IP Address
          </TableSortCell>
          <TableSortCell
            label="region"
            direction={order}
            active={isActive('region')}
            handleClick={handleOrderChange}
            data-qa-sort-region={order}
          >
            Region
          </TableSortCell>
          <TableSortCell
            noWrap
            label="backups:last_successful"
            direction={order}
            active={isActive('backups:last_successful')}
            handleClick={handleOrderChange}
          >
            Last Backup
          </TableSortCell>
        </Hidden>
        <Hidden mdDown>
          <TableCell>Tags</TableCell>
        </Hidden>
        <TableCell>
          <div className={classes.controlHeader}>
            <div id="displayViewDescription" className="visually-hidden">
              Currently in {linodeViewPreference} view
            </div>
            <IconButton
              aria-label="Toggle display"
              aria-describedby={'displayViewDescription'}
              title={`Toggle display`}
              onClick={toggleLinodeView}
              disableRipple
              className={classes.toggleButton}
            >
              <GridView />
            </IconButton>

            <div id="groupByDescription" className="visually-hidden">
              {linodesAreGrouped
                ? 'group by tag is currently enabled'
                : 'group by tag is currently disabled'}
            </div>
            <IconButton
              aria-label={`Toggle group by tag`}
              aria-describedby={'groupByDescription'}
              title={`Toggle group by tag`}
              onClick={toggleGroupLinodes}
              disableRipple
              className={classes.toggleButton}
            >
              <GroupByTag />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
