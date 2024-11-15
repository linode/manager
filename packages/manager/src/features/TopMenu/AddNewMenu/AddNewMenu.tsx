import { Box, Divider, Paper, omittedProps } from '@linode/ui';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import {
  MenuItem,
  MenuList,
  Popover,
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

  const productFamilyLinkGroup: ProductFamilyLinkGroup<MenuLink[]>[] = [
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

  const ProductFamilyGroup = (
    productFamily: ProductFamilyLinkGroup<MenuLink[]>
  ) => {
    return (
      <>
        <StyledHeading paddingTop={productFamily.name === 'Databases'}>
          {productFamily.icon}
          {productFamily.name}
        </StyledHeading>
        {productFamily.links.map(
          (link) =>
            !link.hide && [
              <StyledMenuItem
                component={Link}
                key={link.display}
                onClick={handleClose}
                tabIndex={0}
                to={link.href}
                {...link.attr}
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
              </StyledMenuItem>,
            ]
        )}
      </>
    );
  };

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
      <Popover
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        anchorEl={anchorEl}
        id="basic-menu"
        onClose={handleClose}
        open={open}
      >
        <Paper
          sx={(theme) => ({
            padding: `${theme.spacing(1)} 0`,
            [theme.breakpoints.down('sm')]: {
              padding: 0,
            },
          })}
        >
          <MenuList
            sx={(theme) => ({
              [theme.breakpoints.up('md')]: {
                display: 'flex',
              },
            })}
          >
            {productFamilyLinkGroup.slice(0, 2).map((productFamily) => (
              <>
                <Stack direction="column" key={productFamily.name}>
                  {ProductFamilyGroup(productFamily)}
                </Stack>
                <Divider
                  orientation="vertical"
                  sx={{ height: 'auto', margin: 0, marginTop: 1 }}
                />
              </>
            ))}
            <Stack direction="column">
              {productFamilyLinkGroup
                .slice(2)
                .map((productFamily) => ProductFamilyGroup(productFamily))}
            </Stack>
          </MenuList>
        </Paper>
      </Popover>
    </Box>
  );
};

export const StyledHeading = styled('h3', {
  label: 'StyledHeading',
  shouldForwardProp: omittedProps(['paddingTop']),
})<{ paddingTop?: boolean }>(({ theme, ...props }) => ({
  '& svg': {
    height: 16,
    marginRight: theme.spacing(1),
    width: 16,
  },
  alignItems: 'center',
  background: 'rgb(247, 247, 250)',
  display: 'flex',
  fontFamily: 'LatoWebBold',
  fontSize: '0.75rem',
  letterSpacing: '0.25px',
  margin: 0,
  padding: '8px 12px',
  textTransform: 'uppercase',
  [theme.breakpoints.up('lg')]: {
    background: 'inherit',
    padding: `${props.paddingTop ? '16px' : '8px'} 16px 6px 16px`,
  },
}));

export const StyledMenuItem = styled(MenuItem, {
  label: 'StyledMenuItem',
})(({ theme }) => ({
  padding: '8px 14px',
  // We have to do this because in packages/manager/src/index.css we force underline links
  textDecoration: 'none !important',
  [theme.breakpoints.up('md')]: {
    padding: '8px 16px',
  },
}));
