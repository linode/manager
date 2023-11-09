import { Hidden } from '@mui/material';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu';
import { CircleProgress } from 'src/components/CircleProgress';
import {
  CollapsibleTable,
  TableItem,
} from 'src/components/CollapsibleTable/CollapsibleTable';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLoadBalancerRoutesQuery } from 'src/queries/aglb/routes';

import { RulesTable } from '../RulesTable';
import { DeleteRouteDialog } from './DeleteRouteDialog';
import { DeleteRuleDialog } from './DeleteRuleDialog';
import { EditRouteDrawer } from './EditRouteDrawer';
import { RuleDrawer } from './RuleDrawer';

import type { Filter, Route } from '@linode/api-v4';

const PREFERENCE_KEY = 'loadbalancer-routes';

interface Props {
  configuredRouteIds?: number[];
  filter?: Filter;
  onRemove?: (routeIndex: number) => void;
}

export const RoutesTable = (props: Props) => {
  const { configuredRouteIds, filter: additionalFilter, onRemove } = props;

  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isAddRuleDrawerOpen, setIsAddRuleDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteRuleDialogOpen, setIsDeleteRuleDialogOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<number>();
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number>();

  const pagination = usePagination(1, PREFERENCE_KEY);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${PREFERENCE_KEY}-order`
  );

  const filter: Filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  /**
   * If configuredRoutes is passed, it filters the configured routes form API
   *  Otherwise, it fetches routes without filter in the routes table.
   */
  if (configuredRouteIds) {
    filter['+or'] = configuredRouteIds.map((id) => ({ id }));
  }

  const { data: routes, isLoading } = useLoadBalancerRoutesQuery(
    Number(loadbalancerId),
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    { ...filter, ...additionalFilter }
  );

  const selectedRoute = routes?.data?.find(
    (route) => route.id === selectedRouteId
  );

  const onAddRule = (route: Route) => {
    setIsAddRuleDrawerOpen(true);
    setSelectedRouteId(route.id);
  };

  const onEditRule = (route: Route, ruleIndex: number) => {
    setIsAddRuleDrawerOpen(true);
    setSelectedRouteId(route.id);
    setSelectedRuleIndex(ruleIndex);
  };

  const onDeleteRule = (route: Route, ruleIndex: number) => {
    setIsDeleteRuleDialogOpen(true);
    setSelectedRouteId(route.id);
    setSelectedRuleIndex(ruleIndex);
  };

  const onEditRoute = (route: Route) => {
    setIsEditDrawerOpen(true);
    setSelectedRouteId(route.id);
  };

  const onDeleteRoute = (route: Route) => {
    setIsDeleteDialogOpen(true);
    setSelectedRouteId(route.id);
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  const getTableItems = (): TableItem[] => {
    if (configuredRouteIds && configuredRouteIds.length === 0) {
      return [];
    }
    if (!routes?.data) {
      return [];
    }
    return routes?.data?.map((route, index) => {
      const OuterTableCells = (
        <>
          <Hidden mdDown>
            <TableCell>{route.rules.length}</TableCell>
          </Hidden>
          <Hidden smDown>
            <TableCell>{route.protocol.toLocaleUpperCase()}</TableCell>
          </Hidden>
          <Hidden xsDown>
            <TableCell>{route.id}</TableCell>
          </Hidden>
          <TableCell actionCell>
            <InlineMenuAction
              actionText="Add Rule"
              onClick={() => onAddRule(route)}
            />
            <ActionMenu
              actionsList={[
                { onClick: () => onEditRoute(route), title: 'Edit' },
                onRemove
                  ? { onClick: () => onRemove(index), title: 'Remove' }
                  : { onClick: () => onDeleteRoute(route), title: 'Delete' },
              ]}
              ariaLabel={`Action Menu for Route ${route.label}`}
            />
          </TableCell>
        </>
      );

      const InnerTable = (
        <RulesTable
          loadbalancerId={Number(loadbalancerId)}
          onDeleteRule={(index) => onDeleteRule(route, index)}
          onEditRule={(index) => onEditRule(route, index)}
          route={route}
        />
      );

      return {
        InnerTable,
        OuterTableCells,
        id: route.id,
        label: route.label,
      };
    });
  };

  const RoutesTableRowHead = (
    <TableRow>
      <TableSortCell
        active={orderBy === 'label'}
        direction={order}
        handleClick={handleOrderChange}
        label="label"
      >
        Route Label
      </TableSortCell>
      <Hidden mdDown>
        <TableCell>Rules</TableCell>
      </Hidden>
      <Hidden smDown>
        <TableSortCell
          active={orderBy === 'protocol'}
          direction={order}
          handleClick={handleOrderChange}
          label="protocol"
        >
          Protocol
        </TableSortCell>
      </Hidden>
      <Hidden xsDown>
        <TableSortCell
          active={orderBy === 'id'}
          direction={order}
          handleClick={handleOrderChange}
          label="id"
        >
          ID
        </TableSortCell>
      </Hidden>
      <TableCell></TableCell>
    </TableRow>
  );

  return (
    <>
      <CollapsibleTable
        TableItems={getTableItems()}
        TableRowEmpty={<TableRowEmpty colSpan={5} message={'No Routes'} />}
        TableRowHead={RoutesTableRowHead}
      />
      <PaginationFooter
        count={
          configuredRouteIds ? configuredRouteIds.length : routes?.results ?? 0
        }
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <RuleDrawer
        onClose={() => {
          setIsAddRuleDrawerOpen(false);
          setSelectedRuleIndex(undefined);
        }}
        loadbalancerId={Number(loadbalancerId)}
        open={isAddRuleDrawerOpen}
        route={selectedRoute}
        ruleIndexToEdit={selectedRuleIndex}
      />
      <EditRouteDrawer
        loadbalancerId={Number(loadbalancerId)}
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
        route={selectedRoute}
      />
      <DeleteRouteDialog
        loadbalancerId={Number(loadbalancerId)}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        route={selectedRoute}
      />
      <DeleteRuleDialog
        loadbalancerId={Number(loadbalancerId)}
        onClose={() => setIsDeleteRuleDialogOpen(false)}
        open={isDeleteRuleDialogOpen}
        route={selectedRoute}
        ruleIndex={selectedRuleIndex}
      />
    </>
  );
};
