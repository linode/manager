import { IconButton } from '@linode/ui';
import { Tooltip } from '@linode/ui';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import GridView from 'src/assets/icons/grid-view.svg';
import { GroupByTagToggle } from 'src/components/GroupByTagToggle';
import { Hidden } from '@linode/ui';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

import type { OrderByProps } from 'src/components/OrderBy';

// There's nothing very scientific about the widths across the breakpoints
// here, just a lot of trial and error based on maximum expected column sizes.

interface Props {
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
  toggleGroupLinodes: () => boolean;
  toggleLinodeView: () => 'grid' | 'list';
}

interface SortableTableHeadProps<T>
  extends Props,
    Omit<OrderByProps<T>, 'data'> {}

export const SortableTableHead = <T,>(props: SortableTableHeadProps<T>) => {
  const theme = useTheme();

  const {
    handleOrderChange,
    linodeViewPreference,
    linodesAreGrouped,
    order,
    orderBy,
    toggleGroupLinodes,
    toggleLinodeView,
  } = props;

  const displayViewDescriptionId = React.useId();

  const isActive = (label: string) =>
    label.toLowerCase() === orderBy.toLowerCase();

  return (
    <TableHead data-qa-table-head role="rowgroup">
      <TableRow>
        <TableSortCell
          sx={{
            [theme.breakpoints.down('lg')]: {
              width: '20%',
            },
            width: '24%',
          }}
          active={isActive('label')}
          data-qa-sort-label={order}
          direction={order}
          handleClick={handleOrderChange}
          label="label"
        >
          Label
        </TableSortCell>
        <TableSortCell
          sx={{
            [theme.breakpoints.down('md')]: {
              width: '25%',
            },
            [theme.breakpoints.only('md')]: {
              width: '27%',
            },
            width: '20%',
          }}
          active={isActive('_statusPriority')}
          direction={order}
          handleClick={handleOrderChange}
          label="_statusPriority"
          noWrap
        >
          Status
        </TableSortCell>
        <Hidden smDown>
          <TableSortCell
            sx={{
              [theme.breakpoints.only('sm')]: {
                width: '15%',
              },
              width: '14%',
            }}
            active={isActive('type')}
            direction={order}
            handleClick={handleOrderChange}
            label="type"
          >
            Plan
          </TableSortCell>
          <TableSortCell
            active={isActive('ipv4[0]')}
            direction={order}
            handleClick={handleOrderChange}
            label="ipv4[0]" // we want to sort by the first ipv4
            noWrap
          >
            Public IP Address
          </TableSortCell>
          <Hidden lgDown>
            <TableSortCell
              sx={{
                [theme.breakpoints.down('sm')]: {
                  width: '18%',
                },
                width: '14%',
              }}
              active={isActive('region')}
              data-qa-sort-region={order}
              direction={order}
              handleClick={handleOrderChange}
              label="region"
            >
              Region
            </TableSortCell>
          </Hidden>
        </Hidden>
        <Hidden lgDown>
          <TableSortCell
            sx={{
              [theme.breakpoints.down('sm')]: {
                width: '18%',
              },
              width: '14%',
            }}
            active={isActive('backups:last_successful')}
            direction={order}
            handleClick={handleOrderChange}
            label="backups:last_successful"
            noWrap
          >
            Last Backup
          </TableSortCell>
        </Hidden>
        <TableCell sx={{ padding: '0 !important' }}>
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor:
                theme.tokens.component.Table.HeaderNested.Background,
              display: 'flex',
              gap: 3,
              justifyContent: 'flex-end',
              paddingRight: 1.5,
            }}
          >
            <div className="visually-hidden" id={displayViewDescriptionId}>
              Currently in {linodeViewPreference} view
            </div>
            <Tooltip placement="top" title="Summary view">
              <IconButton
                className={
                  linodeViewPreference === 'grid'
                    ? 'MuiIconButton-isActive'
                    : ''
                }
                sx={{
                  padding: 0,
                }}
                aria-describedby={displayViewDescriptionId}
                aria-label="Toggle display"
                disableRipple
                onClick={toggleLinodeView}
              >
                <GridView />
              </IconButton>
            </Tooltip>
            <GroupByTagToggle
              isGroupedByTag={linodesAreGrouped}
              toggleGroupByTag={toggleGroupLinodes}
            />
          </Box>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
