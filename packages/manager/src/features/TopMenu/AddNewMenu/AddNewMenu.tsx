import * as React from 'react';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import KubernetesIcon from 'src/assets/icons/entityIcons/kubernetes.svg';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import NodebalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import OneClickIcon from 'src/assets/icons/entityIcons/oneclick.svg';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import Button from 'src/components/Button/Button';
import Divider from 'src/components/core/Divider';
import { Link } from 'react-router-dom';
import {
  Box,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

export const AddNewMenu = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const links = [
    {
      entity: 'Linode',
      description: 'High performance SSD Linux servers',
      icon: LinodeIcon,
      link: '/linodes/create',
    },
    {
      entity: 'Volume',
      description: 'Attach additional storage to your Linode',
      icon: VolumeIcon,
      link: '/volumes/create',
    },
    {
      entity: 'NodeBalancer',
      description: 'Ensure your services are highly available',
      icon: NodebalancerIcon,
      link: '/nodebalancers/create',
    },
    {
      entity: 'Firewall',
      description: 'Control network access to your Linodes',
      icon: FirewallIcon,
      link: '/firewalls/create',
    },
    {
      entity: 'Domain',
      description: 'Manage your DNS records',
      icon: DomainIcon,
      link: '/domains/create',
    },
    {
      entity: 'Database',
      description: 'High-performance managed database clusters',
      icon: DatabaseIcon,
      link: '/databases/create',
    },
    {
      entity: 'Kubernetes',
      description: 'Highly available container workloads',
      icon: KubernetesIcon,
      link: '/kubernetes/create',
    },
    {
      entity: 'Bucket',
      description: 'S3-compatible object storage',
      icon: BucketIcon,
      link: '/object-storage/buckets/create',
    },
    {
      entity: 'Marketplace',
      description: 'Deploy applications with ease',
      icon: OneClickIcon,
      link: '/linodes/create?type=One-Click',
      attr: { 'data-qa-one-click-add-new': true },
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
        buttonType="primary"
        id="create-menu"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        data-qa-add-new-menu-button
      >
        Create
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'create-menu',
        }}
        PaperProps={{
          // UX requested a drop shadow that didn't affect the button.
          // If we revise our theme's shadows, we could consider removing
          sx: { boxShadow: '0 2px 3px 3px rgba(0, 0, 0, 0.1)' },
        }}
      >
        {links.map((link, i) => [
          i !== 0 && <Divider spacingTop={0} spacingBottom={0} />,
          <MenuItem
            key={link.entity}
            onClick={handleClose}
            sx={{
              paddingY: 1.5,
              '&:hover': {
                // This MUI Menu gets special colors compared
                // to a standard menu such as the NodeBalancer Config Node Mode select menu
                backgroundColor: theme.bg.app,
              },
            }}
            component={Link}
            to={link.link}
            {...link.attr}
            style={{
              // We have to do this because in packages/manager/src/index.css we force underline links
              textDecoration: 'none',
            }}
          >
            <ListItemIcon>
              <link.icon
                width={20}
                height={20}
                color={theme.palette.text.primary}
              />
            </ListItemIcon>
            <Stack>
              <Typography variant="h3" color={theme.textColors.linkActiveLight}>
                {link.entity}
              </Typography>
              <Typography>{link.description}</Typography>
            </Stack>
          </MenuItem>,
        ])}
      </Menu>
    </Box>
  );
};
