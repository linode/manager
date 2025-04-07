import {
  useLinodeQuery,
  useSubnetQuery,
  useSubnetsQuery,
} from '@linode/queries';
import { Box, Button, CircleProgress, ErrorState } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { CollapsibleTable } from 'src/components/CollapsibleTable/CollapsibleTable';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { PowerActionsDialog } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { SubnetActionMenu } from 'src/features/VPCs/VPCDetail/SubnetActionMenu';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { SUBNET_ACTION_PATH } from '../constants';
import { VPC_DETAILS_ROUTE } from '../constants';
import { SubnetAssignLinodesDrawer } from './SubnetAssignLinodesDrawer';
import { SubnetCreateDrawer } from './SubnetCreateDrawer';
import { SubnetDeleteDialog } from './SubnetDeleteDialog';
import { SubnetEditDrawer } from './SubnetEditDrawer';
import { SubnetLinodeRow, SubnetLinodeTableRowHead } from './SubnetLinodeRow';
import { SubnetUnassignLinodesDrawer } from './SubnetUnassignLinodesDrawer';

import type { Linode } from '@linode/api-v4/lib/linodes/types';
import type { Subnet } from '@linode/api-v4/lib/vpcs/types';
import type { TableItem } from 'src/components/CollapsibleTable/CollapsibleTable';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';

interface Props {
  isVPCLKEEnterpriseCluster: boolean;
  vpcId: number;
  vpcRegion: string;
}

const preferenceKey = 'vpc-subnets';

export const VPCSubnetsTable = (props: Props) => {
  const { isVPCLKEEnterpriseCluster, vpcId, vpcRegion } = props;
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const location = useLocation();

  const [linodePowerAction, setLinodePowerAction] = React.useState<
    Action | undefined
  >();

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: VPC_DETAILS_ROUTE,
    },
    preferenceKey: `${preferenceKey}-order`,
  });

  const search = useSearch({
    from: VPC_DETAILS_ROUTE,
  });
  const { query } = search;

  const pagination = usePaginationV2({
    currentRoute: VPC_DETAILS_ROUTE,
    preferenceKey,
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const generateSubnetsXFilter = (searchText: string) => {
    if (searchText === '') {
      return filter;
    }
    return {
      '+or': [
        {
          label: { '+contains': searchText },
        },
        {
          id: { '+contains': searchText },
        },
      ],
      ...filter,
    };
  };

  const { data: subnets, error, isLoading } = useSubnetsQuery(
    vpcId,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    generateSubnetsXFilter(query ?? '')
  );

  const { data: selectedSubnet, isFetching: isFetchingSubnet } = useDialogData({
    enabled: !!params.vpcId && !!params.subnetId,
    paramKey: 'vpcId',
    queryHook: useSubnetQuery,
    redirectToOnNotFound: '/vpcs/$vpcId',
    secondaryParamKey: 'subnetId',
  });

  const { data: selectedLinode, isFetching: isFetchingLinode } = useDialogData({
    enabled: !!params.linodeId,
    paramKey: 'linodeId',
    queryHook: useLinodeQuery,
    redirectToOnNotFound: '/vpcs/$vpcId',
  });

  const handleSearch = (searchText: string) => {
    navigate({
      params: { vpcId },
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: searchText || undefined,
      }),
      to: VPC_DETAILS_ROUTE,
    });
  };

  const onCloseSubnetDrawer = () => {
    navigate({
      params: { vpcId },
      to: VPC_DETAILS_ROUTE,
    });
  };

  const handleSubnetCreate = () => {
    navigate({ params: { vpcId }, to: '/vpcs/$vpcId/subnets/create' });
  };

  const handleSubnetDelete = (subnet: Subnet) => {
    navigate({
      params: { subnetAction: 'delete', subnetId: subnet.id, vpcId },
      to: SUBNET_ACTION_PATH,
    });
  };

  const handleSubnetEdit = (subnet: Subnet) => {
    navigate({
      params: { subnetAction: 'edit', subnetId: subnet.id, vpcId },
      to: SUBNET_ACTION_PATH,
    });
  };

  const handleSubnetUnassignLinodes = (subnet: Subnet) => {
    navigate({
      params: { subnetAction: 'unassign', subnetId: subnet.id, vpcId },
      to: SUBNET_ACTION_PATH,
    });
  };

  const handleSubnetUnassignLinode = (linode: Linode, subnet: Subnet) => {
    navigate({
      params: {
        linodeAction: 'unassign',
        linodeId: linode.id,
        subnetId: subnet.id,
        vpcId,
      },
      to: '/vpcs/$vpcId/subnets/$subnetId/linodes/$linodeId/$linodeAction',
    });
  };

  const handleSubnetAssignLinodes = (subnet: Subnet) => {
    navigate({
      params: { subnetAction: 'assign', subnetId: subnet.id, vpcId },
      to: SUBNET_ACTION_PATH,
    });
  };

  const handlePowerActionsLinode = (
    linode: Linode,
    action: Action,
    subnet: Subnet
  ) => {
    setLinodePowerAction(action);
    navigate({
      params: {
        linodeAction: 'power-action',
        linodeId: linode.id,
        subnetId: subnet.id ?? selectedSubnet?.id ?? -1,
        vpcId,
      },
      to: '/vpcs/$vpcId/subnets/$subnetId/linodes/$linodeId/$linodeAction',
    });
  };

  // If the user initiates a history -/+ to complete a linode action and the linode
  // is no longer assigned to the subnet, push navigation to the vpc's detail page
  React.useEffect(() => {
    if (
      params.linodeAction &&
      selectedLinode &&
      selectedSubnet &&
      !selectedSubnet?.linodes.some((linode) => linode.id === selectedLinode.id)
    ) {
      navigate({
        params: { vpcId },
        to: VPC_DETAILS_ROUTE,
      });
      enqueueSnackbar(`Linode ${selectedLinode.label} not found in subnet`, {
        variant: 'error',
      });
    }
  }, [
    selectedSubnet,
    vpcId,
    navigate,
    params.linodeAction,
    selectedLinode,
    enqueueSnackbar,
  ]);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!subnets || error) {
    return (
      <ErrorState errorText="There was a problem retrieving your subnets. Please try again." />
    );
  }

  const SubnetTableRowHead = (
    <TableRow>
      <TableSortCell
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            width: '50%',
          },
          width: '24%',
        })}
        active={orderBy === 'label'}
        direction={order}
        handleClick={handleOrderChange}
        label="label"
      >
        Subnet Label
      </TableSortCell>
      <Hidden smDown>
        <TableSortCell
          active={orderBy === 'id'}
          direction={order}
          handleClick={handleOrderChange}
          label="id"
          sx={{ width: '10%' }}
        >
          Subnet ID
        </TableSortCell>
      </Hidden>
      <TableCell sx={{ width: '18%' }}>Subnet IP Range</TableCell>
      <Hidden smDown>
        <TableCell sx={{ width: '10%' }}>Linodes</TableCell>
      </Hidden>
      <TableCell />
    </TableRow>
  );

  const getTableItems = (): TableItem[] => {
    return subnets.data.map((subnet) => {
      const OuterTableCells = (
        <>
          <Hidden smDown>
            <TableCell>{subnet.id}</TableCell>
          </Hidden>
          <TableCell>{subnet.ipv4}</TableCell>
          <Hidden smDown>
            <TableCell>{subnet.linodes.length}</TableCell>
          </Hidden>
          <TableCell actionCell>
            <SubnetActionMenu
              handleAssignLinodes={handleSubnetAssignLinodes}
              handleDelete={handleSubnetDelete}
              handleEdit={handleSubnetEdit}
              handleUnassignLinodes={handleSubnetUnassignLinodes}
              isVPCLKEEnterpriseCluster={isVPCLKEEnterpriseCluster}
              numLinodes={subnet.linodes.length}
              subnet={subnet}
              vpcId={vpcId}
            />
          </TableCell>
        </>
      );

      const InnerTable = (
        <Table aria-label="Linode" size="small" striped={false}>
          <TableHead
            style={{
              color: theme.tokens.color.Neutrals.White,
              fontSize: '.875rem',
            }}
          >
            {SubnetLinodeTableRowHead}
          </TableHead>
          <TableBody>
            {subnet.linodes.length > 0 ? (
              subnet.linodes.map((linodeInfo) => (
                <SubnetLinodeRow
                  handlePowerActionsLinode={handlePowerActionsLinode}
                  handleUnassignLinode={handleSubnetUnassignLinode}
                  isVPCLKEEnterpriseCluster={isVPCLKEEnterpriseCluster}
                  key={linodeInfo.id}
                  linodeId={linodeInfo.id}
                  subnet={subnet}
                  subnetId={subnet.id}
                />
              ))
            ) : (
              <TableRowEmpty colSpan={6} message={'No Linodes'} />
            )}
          </TableBody>
        </Table>
      );

      return {
        InnerTable,
        OuterTableCells,
        id: subnet.id,
        label: `${subnet.label}${
          isVPCLKEEnterpriseCluster ? ' (Managed)' : ''
        }`,
      };
    });
  };

  return (
    <>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">
        <DebouncedSearchTextField
          sx={{
            marginBottom: theme.spacingFunction(16),
            [theme.breakpoints.up('sm')]: {
              width: '416px',
            },
            width: '250px',
          }}
          debounceTime={250}
          hideLabel
          isSearching={false}
          label="Filter Subnets by label or id"
          onSearch={handleSearch}
          placeholder="Filter Subnets by label or id"
          value={query ?? ''}
        />
        <Button
          sx={{
            marginBottom: theme.spacingFunction(16),
          }}
          buttonType="primary"
          disabled={isVPCLKEEnterpriseCluster}
          onClick={handleSubnetCreate}
        >
          Create Subnet
        </Button>
      </Box>
      <SubnetCreateDrawer
        onClose={onCloseSubnetDrawer}
        open={location.pathname.includes('subnets/create')}
        vpcId={vpcId}
      />
      <CollapsibleTable
        TableRowEmpty={
          <TableRowEmpty colSpan={5} message={'No Subnets are assigned.'} />
        }
        TableItems={getTableItems()}
        TableRowHead={SubnetTableRowHead}
      />
      <PaginationFooter
        count={subnets.results || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <SubnetUnassignLinodesDrawer
        open={
          params.subnetAction === 'unassign' ||
          params.linodeAction === 'unassign'
        }
        isFetching={isFetchingSubnet || isFetchingLinode}
        onClose={onCloseSubnetDrawer}
        singleLinodeToBeUnassigned={selectedLinode}
        subnet={selectedSubnet}
        vpcId={vpcId}
      />
      <SubnetAssignLinodesDrawer
        isFetching={isFetchingSubnet}
        onClose={onCloseSubnetDrawer}
        open={params.subnetAction === 'assign'}
        subnet={selectedSubnet}
        vpcId={vpcId}
        vpcRegion={vpcRegion}
      />
      <SubnetDeleteDialog
        isFetching={isFetchingSubnet}
        onClose={onCloseSubnetDrawer}
        open={params.subnetAction === 'delete'}
        subnet={selectedSubnet}
        vpcId={vpcId}
      />
      <SubnetEditDrawer
        isFetching={isFetchingSubnet}
        onClose={onCloseSubnetDrawer}
        open={params.subnetAction === 'edit'}
        subnet={selectedSubnet}
        vpcId={vpcId}
      />
      <PowerActionsDialog
        action={linodePowerAction ?? 'Reboot'}
        isFetching={isFetchingLinode}
        isOpen={params.linodeAction === 'power-action'}
        linodeId={selectedLinode?.id}
        linodeLabel={selectedLinode?.label}
        onClose={onCloseSubnetDrawer}
      />
    </>
  );
};
