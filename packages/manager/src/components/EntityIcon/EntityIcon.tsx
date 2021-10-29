import * as React from 'react';
import StorageIcon from 'src/assets/icons/entityIcons/bucket.svg?component';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg?component';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg?component';
import FolderIcon from 'src/assets/icons/entityIcons/folder.svg?component';
import ImageIcon from 'src/assets/icons/entityIcons/image.svg?component';
import KubernetesIcon from 'src/assets/icons/entityIcons/kubernetes.svg?component';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg?component';
import ManagedIcon from 'src/assets/icons/entityIcons/managed.svg?component';
import NodeBalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg?component';
import ObjectIcon from 'src/assets/icons/entityIcons/object.svg?component';
import MarketplaceIcon from 'src/assets/icons/entityIcons/oneclick.svg?component';
import StackScriptIcon from 'src/assets/icons/entityIcons/stackscript.svg?component';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg?component';
import LongviewIcon from 'src/assets/icons/longview.svg?component';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    color: theme.color.grey1,
    position: 'relative',
  },
}));

export type Variant =
  | 'managed'
  | 'linode'
  | 'volume'
  | 'nodebalancer'
  | 'firewall'
  | 'stackscript'
  | 'image'
  | 'domain'
  | 'kubernetes'
  | 'storage'
  | 'longview'
  | 'marketplace'
  | 'object'
  | 'folder';

interface Props {
  variant: Variant;
  status?: string;
  loading?: boolean;
  size?: number;
  className?: any;
  marginTop?: number;
  stopAnimation?: boolean;
}

type CombinedProps = Props;

const iconMap = {
  managed: ManagedIcon,
  linode: LinodeIcon,
  volume: VolumeIcon,
  nodebalancer: NodeBalancerIcon,
  firewall: FirewallIcon,
  stackscript: StackScriptIcon,
  image: ImageIcon,
  domain: DomainIcon,
  kube: KubernetesIcon,
  bucket: StorageIcon,
  longview: LongviewIcon,
  oca: MarketplaceIcon,
  object: ObjectIcon,
  folder: FolderIcon,
};

const getIcon = (variant: Variant) => {
  return iconMap[variant] ?? LinodeIcon;
};

const EntityIcon: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    variant,
    status,
    loading,
    size,
    className,
    marginTop,
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
    <div
      className={`${classes.root} ${className}`}
      style={{ top: marginTop }}
      data-qa-icon={variant}
      data-qa-entity-status={status || 'undefined'}
      data-qa-is-loading={loading || 'false'}
      aria-label={`${variant} is ${finalStatus}`}
      {...rest}
    >
      <Icon height={iconSize} width={iconSize} />
    </div>
  );
};

export default EntityIcon;