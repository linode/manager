import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import * as React from 'react';
import { Link } from 'react-router-dom';

import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import KubernetesIcon from 'src/assets/icons/entityIcons/kubernetes.svg';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import NodebalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import OneClickIcon from 'src/assets/icons/entityIcons/oneclick.svg';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import VPCIcon from 'src/assets/icons/entityIcons/vpc.svg';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

interface LinkProps {
  attr?: { [key: string]: boolean };
  description: string;
  entity: string;
  hide?: boolean;
  icon: React.ComponentClass<any, any>;
  link: string;
}

export const AddNewMenu = () => {
  const theme = useTheme();
  const { data: account } = useAccount();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const flags = useFlags();
  const open = Boolean(anchorEl);

  const showDatabases = isFeatureEnabled(
    'Managed Databases',
    Boolean(flags.databases),
    account?.capabilities ?? []
  );

  const showVPCs = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const links: LinkProps[] = [
    {
      description: 'High performance SSD Linux servers',
      entity: 'Linode',
      icon: LinodeIcon,
      link: '/linodes/create',
    },
    {
      description: 'Attach additional storage to your Linode',
      entity: 'Volume',
      icon: VolumeIcon,
      link: '/volumes/create',
    },
    {
      // TODO AGLB: Replace with AGLB copy when available
      description: 'Ensure your services are highly available',
      entity: 'Global Load Balancer',
      hide: !flags.aglb,
      // TODO AGLB: Change this icon to the AGLB icon when available
      icon: DomainIcon,
      link: '/loadbalancers/create',
    },
    {
      description: 'Ensure your services are highly available',
      entity: 'NodeBalancer',
      icon: NodebalancerIcon,
      link: '/nodebalancers/create',
    },
    {
      description: 'Create a private and isolated network',
      entity: 'VPC',
      hide: !showVPCs,
      icon: VPCIcon,
      link: '/vpcs/create',
    },
    {
      description: 'Control network access to your Linodes',
      entity: 'Firewall',
      icon: FirewallIcon,
      link: '/firewalls/create',
    },
    {
      description: 'Manage your DNS records',
      entity: 'Domain',
      icon: DomainIcon,
      link: '/domains/create',
    },
    {
      description: 'High-performance managed database clusters',
      entity: 'Database',
      hide: !showDatabases,
      icon: DatabaseIcon,
      link: '/databases/create',
    },
    {
      description: 'Highly available container workloads',
      entity: 'Kubernetes',
      icon: KubernetesIcon,
      link: '/kubernetes/create',
    },
    {
      description: 'S3-compatible object storage',
      entity: 'Bucket',
      icon: BucketIcon,
      link: '/object-storage/buckets/create',
    },
    {
      attr: { 'data-qa-one-click-add-new': true },
      description: 'Deploy applications with ease',
      entity: 'Marketplace',
      icon: OneClickIcon,
      link: '/linodes/create?type=One-Click',
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
        {links.map(
          (link, i) =>
            !link.hide && [
              i !== 0 && <Divider spacingBottom={0} spacingTop={0} />,
              <MenuItem
                sx={{
                  '&:hover': {
                    // This MUI Menu gets special colors compared
                    // to a standard menu such as the NodeBalancer Config Node Mode select menu
                    backgroundColor: theme.bg.app,
                  },
                  paddingY: 1.5,
                }}
                component={Link}
                key={link.entity}
                onClick={handleClose}
                to={link.link}
                {...link.attr}
                style={{
                  // We have to do this because in packages/manager/src/index.css we force underline links
                  textDecoration: 'none',
                }}
              >
                <ListItemIcon>
                  <link.icon
                    color={theme.palette.text.primary}
                    height={20}
                    width={20}
                  />
                </ListItemIcon>
                <Stack>
                  <Typography
                    color={theme.textColors.linkActiveLight}
                    variant="h3"
                  >
                    {link.entity}
                  </Typography>
                  <Typography>{link.description}</Typography>
                </Stack>
              </MenuItem>,
            ]
        )}
      </Menu>
    </Box>
  );
};
