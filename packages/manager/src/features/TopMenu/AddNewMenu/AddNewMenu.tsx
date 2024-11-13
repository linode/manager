import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import NodebalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import { Button } from 'src/components/Button/Button';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useIsPlacementGroupsEnabled } from 'src/features/PlacementGroups/utils';

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
  | 'Longview'
  | 'Marketplace'
  | 'NodeBalancer'
  | 'Object Storage'
  | 'Placement Group'
  | 'VPC'
  | 'Volume';

interface MenuLink extends BaseNavLink {
  description?: string;
}

export const AddNewMenu = () => {
  const theme = useTheme();
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

  const productFamilyLinkGroups: ProductFamilyLinkGroup<MenuLink[]>[] = [
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
          href: '/kubernetes/clusters/create',
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
    <Box
      sx={{
        [theme.breakpoints.down('md')]: {
          flex: 1,
        },
      }}
    >
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
      <Menu
        MenuListProps={{
          'aria-labelledby': 'create-menu',
        }}
        slotProps={{
          paper: {
            // UX requested a drop shadow that didn't affect the button.
            // If we revise our theme's shadows, we could consider removing
            sx: { boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)' },
          },
        }}
        sx={{
          '& hr': {
            marginBottom: '0 !important',
            marginTop: '0 !important',
          },
        }}
        anchorEl={anchorEl}
        id="basic-menu"
        onClose={handleClose}
        open={open}
      >
        {productFamilyLinkGroups.map((productFamily) => (
          <>
            <StyledHeading>
              {productFamily.icon}
              {productFamily.name}
            </StyledHeading>
            {productFamily.links.map(
              (link) =>
                !link.hide && [
                  <MenuItem
                    component={Link}
                    key={link.display}
                    onClick={handleClose}
                    to={link.href}
                    {...link.attr}
                    style={{
                      padding: '8px 12px',
                      // We have to do this because in packages/manager/src/index.css we force underline links
                      textDecoration: 'none',
                    }}
                    tabIndex={0}
                  >
                    <Stack>
                      <Typography
                        sx={{
                          color: theme.color.offBlack,
                          fontFamily: theme.font.bold,
                          fontSize: '1rem',
                          lineHeight: '1.4rem',
                        }}
                      >
                        {link.display}
                      </Typography>
                      <Typography>{link.description}</Typography>
                    </Stack>
                  </MenuItem>,
                ]
            )}
          </>
        ))}
      </Menu>
    </Box>
  );
};

export const StyledHeading = styled('h3', {
  label: 'StyledHeading',
})(({ theme }) => ({
  '& svg': {
    height: 16,
    marginRight: theme.spacing(1),
    width: 16,
  },
  alignItems: 'center',
  background: 'rgb(247, 247, 250)',
  display: 'flex',
  fontSize: '0.75rem',
  letterSpacing: '0.25px',
  margin: 0,
  padding: '8px 10px',
  textTransform: 'uppercase',
}));
