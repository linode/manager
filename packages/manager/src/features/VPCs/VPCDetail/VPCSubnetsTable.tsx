import { useSubnetsQuery } from '@linode/queries';
import { Box, Button, CircleProgress, ErrorState } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
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
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';

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
  const [subnetsFilterText, setSubnetsFilterText] = React.useState('');
  const [selectedSubnet, setSelectedSubnet] = React.useState<
    Subnet | undefined
  >();
  const [selectedLinode, setSelectedLinode] = React.useState<
    Linode | undefined
  >();
  const [deleteSubnetDialogOpen, setDeleteSubnetDialogOpen] = React.useState(
    false
  );
  const [editSubnetsDrawerOpen, setEditSubnetsDrawerOpen] = React.useState(
    false
  );
  const [subnetCreateDrawerOpen, setSubnetCreateDrawerOpen] = React.useState(
    false
  );
  const [
    subnetAssignLinodesDrawerOpen,
    setSubnetAssignLinodesDrawerOpen,
  ] = React.useState(false);
  const [powerActionDialogOpen, setPowerActionDialogOpen] = React.useState(
    false
  );
  const [linodePowerAction, setLinodePowerAction] = React.useState<
    Action | undefined
  >();

  const [
    subnetUnassignLinodesDrawerOpen,
    setSubnetUnassignLinodesDrawerOpen,
  ] = React.useState(false);

  const pagination = usePagination(1, preferenceKey);

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
    generateSubnetsXFilter(subnetsFilterText)
  );

  const handleSearch = (searchText: string) => {
    setSubnetsFilterText(searchText);
    // If you're on page 2+, need to go back to page 1 to see the actual results
    pagination.handlePageChange(1);
  };

  const handleSubnetDelete = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setDeleteSubnetDialogOpen(true);
  };

  const handleEditSubnet = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setEditSubnetsDrawerOpen(true);
  };

  const handleSubnetUnassignLinodes = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setSubnetUnassignLinodesDrawerOpen(true);
  };

  const handleSubnetUnassignLinode = (linode: Linode, subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setSelectedLinode(linode);
    setSubnetUnassignLinodesDrawerOpen(true);
  };

  const handleSubnetAssignLinodes = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setSubnetAssignLinodesDrawerOpen(true);
  };

  const handlePowerActionsLinode = (linode: Linode, action: Action) => {
    setSelectedLinode(linode);
    setPowerActionDialogOpen(true);
    setLinodePowerAction(action);
  };

  // Ensure that the selected subnet passed to the drawer is up to date
  React.useEffect(() => {
    if (subnets && selectedSubnet) {
      const updatedSubnet = subnets.data.find(
        (subnet) => subnet.id === selectedSubnet.id
      );
      setSelectedSubnet(updatedSubnet);
    }
  }, [subnets, selectedSubnet]);

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
              handleEdit={handleEditSubnet}
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
                  subnetInterfaces={linodeInfo.interfaces}
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
            marginBottom: theme.spacing(2),
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
          value={subnetsFilterText}
        />
        <Button
          sx={{
            marginBottom: theme.spacing(2),
          }}
          buttonType="primary"
          disabled={isVPCLKEEnterpriseCluster}
          onClick={() => setSubnetCreateDrawerOpen(true)}
        >
          Create Subnet
        </Button>
      </Box>
      <SubnetCreateDrawer
        onClose={() => setSubnetCreateDrawerOpen(false)}
        open={subnetCreateDrawerOpen}
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
        count={subnets.data?.length || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <SubnetUnassignLinodesDrawer
        onClose={() => {
          setSubnetUnassignLinodesDrawerOpen(false);
          setSelectedLinode(undefined);
        }}
        open={subnetUnassignLinodesDrawerOpen}
        singleLinodeToBeUnassigned={selectedLinode}
        subnet={selectedSubnet}
        vpcId={vpcId}
      />
      <SubnetAssignLinodesDrawer
        onClose={() => setSubnetAssignLinodesDrawerOpen(false)}
        open={subnetAssignLinodesDrawerOpen}
        subnet={selectedSubnet}
        vpcId={vpcId}
        vpcRegion={vpcRegion}
      />
      <SubnetDeleteDialog
        onClose={() => setDeleteSubnetDialogOpen(false)}
        open={deleteSubnetDialogOpen}
        subnet={selectedSubnet}
        vpcId={vpcId}
      />
      <SubnetEditDrawer
        onClose={() => setEditSubnetsDrawerOpen(false)}
        open={editSubnetsDrawerOpen}
        subnet={selectedSubnet}
        vpcId={vpcId}
      />
      <PowerActionsDialog
        action={linodePowerAction ?? 'Reboot'}
        isOpen={powerActionDialogOpen}
        linodeId={selectedLinode?.id}
        linodeLabel={selectedLinode?.label}
        onClose={() => setPowerActionDialogOpen(false)}
      />
    </>
  );
};
