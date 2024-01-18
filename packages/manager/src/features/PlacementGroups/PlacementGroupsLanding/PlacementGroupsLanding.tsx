import CloseIcon from '@mui/icons-material/Close';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { IconButton } from 'src/components/IconButton';
import { InputAdornment } from 'src/components/InputAdornment';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { usePlacementGroupsQuery } from 'src/queries/placementGroups';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { MAX_NUMBER_OF_PLACEMENT_GROUPS } from '../constants';
import { PlacementGroupsRow } from './PlacementGroupsRow';

import type { PlacementGroup } from '@linode/api-v4';
import { Hidden } from '@mui/material';

const preferenceKey = 'placement-groups';

export const PlacementGroupsLanding = React.memo(() => {
  const history = useHistory();
  const pagination = usePagination(1, preferenceKey);
  const [_selectedPlacementGroup, setSelectedPlacementGroup] = React.useState<
    PlacementGroup | undefined
  >();
  const [query, setQuery] = React.useState<string>('');
  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  if (query) {
    filter['label'] = { '+contains': query };
  }

  const params = {
    page: pagination.page,
    page_size: pagination.pageSize,
  };

  const { data: placementGroups, error, isLoading } = usePlacementGroupsQuery(
    params,
    filter
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  // if (placementGroups?.results === 0) {
  //   return {
  //     /* TODO VM_Placement: add <PlacementGroupsEmptyState /> */
  //   };
  // }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your Placement Groups.')[0]
            .reason
        }
      />
    );
  }

  const onOpenCreateDrawer = () => {
    history.push('/placement-groups/create');
  };

  const handleRenamePlacementGroup = (placementGroup: PlacementGroup) => {
    setSelectedPlacementGroup(placementGroup);
  };

  const handleDeletePlacementGroup = (placementGroup: PlacementGroup) => {
    setSelectedPlacementGroup(placementGroup);
  };

  return (
    <>
      <LandingHeader
        breadcrumbProps={{ pathname: '/placement-groups' }}
        docsLink={'TODO VM_Placement: add doc link'}
        entity="Placement Group"
        onButtonClick={onOpenCreateDrawer}
        title="Placement Groups"
      />
      <Typography sx={{ mb: 4, mt: 2 }}>
        The maximum amount of Placement Groups is{' '}
        {MAX_NUMBER_OF_PLACEMENT_GROUPS} per account.
      </Typography>
      <TextField
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton
                aria-label="Clear"
                onClick={() => setQuery('')}
                size="small"
                sx={{ padding: 'unset' }}
              >
                <CloseIcon sx={{ color: '#aaa !important' }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        hideLabel
        label="Filter"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter"
        sx={{ mb: 4 }}
        value={query}
      />
      <Table aria-label="List of Placement Groups">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableCell>Linodes</TableCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {placementGroups?.data.map((placementGroup) => (
            <PlacementGroupsRow
              handleDeletePlacementGroup={() =>
                handleDeletePlacementGroup(placementGroup)
              }
              handleRenamePlacementGroup={() =>
                handleRenamePlacementGroup(placementGroup)
              }
              key={`pg-${placementGroup.id}`}
              placementGroup={placementGroup}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={placementGroups?.results ?? 0}
        eventCategory="Placement Groups Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      {/* TODO VM_Placement: add delete dialog */}
      {/* TODO VM_Placement: add create/edit drawer */}
    </>
  );
});
