import { Box, Button, Divider } from '@linode/ui';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { Popover, Stack } from '@mui/material';
import * as React from 'react';

import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import NodebalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';

import { StyledMenuList, StyledPaper } from './CreateMenu.styles';
import { ProductFamilyGroup } from './ProductFamilyGroup';

import type { BaseNavLink } from 'src/components/PrimaryNav/PrimaryLink';
import type { ProductFamilyLinkGroup } from 'src/components/PrimaryNav/PrimaryNav';

export type CreateEntity =
  | 'Bucket'
  | 'Database'
  | 'Domain'
  | 'Firewall'
  | 'Image'
  | 'Kubernetes'
  | 'Linode'
  | 'Marketplace'
  | 'NodeBalancer'
  | 'Object Storage'
  | 'Placement Group'
  | 'VPC'
  | 'Volume';

export interface CreateMenuLink extends BaseNavLink {
  description?: string;
}

export const CreateMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const productFamilyLinkGroup: ProductFamilyLinkGroup<CreateMenuLink[]>[] = [
    {
      icon: <LinodeIcon />,
      links: [
        {
          description: 'High performance SSD Linux servers',
          display: 'Linode',
          href: '/linodes/create',
        },
        {
          description: 'Capture or upload Linux images',
          display: 'Image',
          href: '/images/create',
        },
        {
          description: 'Highly available container workloads',
          display: 'Kubernetes',
          href: '/kubernetes/create',
        },
        {
          description: "Control your Linodes' physical placement",
          display: 'Placement Group',
          hide: !isPlacementGroupsEnabled,
          href: '/placement-groups/create',
        },
        {
          attr: { 'data-qa-one-click-add-new': true },
          description: 'Deploy applications with ease',
          display: 'Marketplace',
          href: '/linodes/create?type=One-Click',
        },
      ],
      name: 'Compute',
    },
    {
      icon: <NodebalancerIcon />,
      links: [
        {
          description: 'Create a private and isolated network',
          display: 'VPC',
          href: '/vpcs/create',
        },
        {
          description: 'Control network access to your Linodes',
          display: 'Firewall',
          href: '/firewalls/create',
        },
        {
          description: 'Ensure your services are highly available',
          display: 'NodeBalancer',
          href: '/nodebalancers/create',
        },
        {
          description: 'Manage your DNS records',
          display: 'Domain',
          href: '/domains/create',
        },
      ],
      name: 'Networking',
    },
    {
      icon: <BucketIcon />,
      links: [
        {
          description: 'S3-compatible object storage',
          display: 'Bucket',
          href: '/object-storage/buckets/create',
        },
        {
          description: 'Attach additional storage to your Linode',
          display: 'Volume',
          href: '/volumes/create',
        },
      ],
      name: 'Storage',
    },
    {
      icon: <DatabaseIcon />,
      links: [
        {
          description: 'High-performance managed database clusters',
          display: 'Database',
          hide: !isDatabasesEnabled,
          href: '/databases/create',
        },
      ],
      name: 'Databases',
    },
  ];

  return (
    <Box>
      <Button
        aria-controls={open ? 'basic-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        buttonType="primary"
        data-qa-add-new-menu-button
        endIcon={open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        id="create-menu"
        onClick={handleClick}
      >
        Create
      </Button>
      <Popover
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        anchorEl={anchorEl}
        aria-labelledby="create-menu"
        id="basic-menu"
        onClose={handleClose}
        open={open}
      >
        <StyledPaper>
          <StyledMenuList>
            <Stack direction="column" tabIndex={-1}>
              <ProductFamilyGroup
                handleClose={handleClose}
                productFamily={productFamilyLinkGroup[0]}
              />
            </Stack>
            <Divider
              orientation="vertical"
              sx={{ height: 'auto', margin: 0, marginTop: 1 }}
            />
            <Stack direction="column" tabIndex={-1}>
              <ProductFamilyGroup
                handleClose={handleClose}
                productFamily={productFamilyLinkGroup[1]}
              />
            </Stack>
            <Divider
              orientation="vertical"
              sx={{ height: 'auto', margin: 0, marginTop: 1 }}
            />
            <Stack direction="column" tabIndex={-1}>
              {productFamilyLinkGroup.slice(2).map((productFamilyGroup) => (
                <ProductFamilyGroup
                  handleClose={handleClose}
                  key={productFamilyGroup.name}
                  productFamily={productFamilyGroup}
                />
              ))}
            </Stack>
          </StyledMenuList>
        </StyledPaper>
      </Popover>
    </Box>
  );
};
