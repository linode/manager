import { styled } from '@mui/material/styles';
import * as React from 'react';

import StorageIcon from 'src/assets/icons/entityIcons/bucket.svg';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg';
import FolderIcon from 'src/assets/icons/entityIcons/folder.svg';
import ImageIcon from 'src/assets/icons/entityIcons/image.svg';
import KubernetesIcon from 'src/assets/icons/entityIcons/kubernetes.svg';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import ManagedIcon from 'src/assets/icons/entityIcons/managed.svg';
import NodeBalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import ObjectIcon from 'src/assets/icons/entityIcons/object.svg';
import MarketplaceIcon from 'src/assets/icons/entityIcons/oneclick.svg';
import StackScriptIcon from 'src/assets/icons/entityIcons/stackscript.svg';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import LongviewIcon from 'src/assets/icons/longview.svg';

export type EntityVariants =
  | 'database'
  | 'domain'
  | 'firewall'
  | 'folder'
  | 'image'
  | 'kubernetes'
  | 'linode'
  | 'longview'
  | 'managed'
  | 'marketplace'
  | 'nodebalancer'
  | 'object'
  | 'stackscript'
  | 'storage'
  | 'volume';

interface EntityIconProps {
  className?: any;
  loading?: boolean;
  marginTop?: number;
  size?: number;
  status?: string;
  stopAnimation?: boolean;
  style?: React.CSSProperties;
  variant: EntityVariants;
}

const iconMap = {
  database: DatabaseIcon,
  domain: DomainIcon,
  firewall: FirewallIcon,
  folder: FolderIcon,
  image: ImageIcon,
  kubernetes: KubernetesIcon,
  linode: LinodeIcon,
  longview: LongviewIcon,
  managed: ManagedIcon,
  marketplace: MarketplaceIcon,
  nodebalancer: NodeBalancerIcon,
  object: ObjectIcon,
  stackscript: StackScriptIcon,
  storage: StorageIcon,
  volume: VolumeIcon,
};

const getIcon = (variant: EntityVariants) => {
  return iconMap[variant] ?? LinodeIcon;
};

export const EntityIcon = (props: EntityIconProps) => {
  const {
    className,
    loading,
    marginTop,
    size,
    status,
    style,
    variant,
    ...rest
  } = props;

  const iconSize = size ? size : 40;

  const Icon = getIcon(variant);

  const getStatusForDomain = (domainStatus: string) => {
    switch (domainStatus) {
      case 'edit_mode':
        return 'edit';
      case 'active':
        return 'running';
      case 'disabled':
        return 'offline';
      case 'has_errors':
        return 'error';
      default:
        return 'offline';
    }
  };

  const getStatusForFirewall = (firewallStatus: string) =>
    firewallStatus === 'enabled' ? 'running' : 'offline';

  const finalStatus =
    variant === 'domain'
      ? status && getStatusForDomain(status)
      : variant === 'firewall'
      ? status && getStatusForFirewall(status)
      : status;

  return (
    <EntityIconRoot
      aria-label={`${variant} is ${finalStatus}`}
      className={className}
      data-qa-entity-status={status || 'undefined'}
      data-qa-icon={variant}
      data-qa-is-loading={loading || 'false'}
      style={{ top: marginTop, ...style }}
      {...rest}
    >
      <Icon height={iconSize} width={iconSize} />
    </EntityIconRoot>
  );
};

const EntityIconRoot = styled('div')(({ theme }) => ({
  color: theme.color.grey1,
  display: 'flex',
  position: 'relative',
}));
