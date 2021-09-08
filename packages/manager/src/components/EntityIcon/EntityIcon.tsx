import * as React from 'react';
import StorageIcon from 'src/assets/icons/entityIcons/bucket.svg';
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
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    color: theme.color.grey1,
    position: 'relative',
  },
  storyItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 125,
    '& svg': {
      color: '#333',
    },
  },
  storyLabel: {
    fontSize: '0.875rem',
    margin: theme.spacing(),
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

const variantList = [
  { displayName: 'Managed', name: 'managed' },
  { displayName: 'Linode', name: 'linode' },
  { displayName: 'Volume', name: 'volume' },
  { displayName: 'NodeBalancer', name: 'nodebalancer' },
  { displayName: 'Firewall', name: 'firewall' },
  { displayName: 'StackScript', name: 'stackscript' },
  { displayName: 'Image', name: 'image' },
  { displayName: 'Domain', name: 'domain' },
  { displayName: 'Kubernetes', name: 'kube' },
  { displayName: 'Object Storage', name: 'bucket' },
  { displayName: 'Longview', name: 'longview' },
  { displayName: 'Marketplace', name: 'oca' },
];

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

export const EntityIconStory = () => {
  const classes = useStyles();

  return (
    <Grid container>
      {variantList.map((variant, idx) => {
        return (
          <Grid key={idx} item className={classes.storyItem}>
            <EntityIcon variant={variant.name as Variant} />
            <div className={classes.storyLabel}>{variant.displayName}</div>
          </Grid>
        );
      })}
    </Grid>
  );
};
