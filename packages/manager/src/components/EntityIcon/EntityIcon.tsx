import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg?component';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg?component';
import FirewallIcon from 'src/assets/icons/entityIcons/firewall.svg?component';
import FolderIcon from 'src/assets/icons/entityIcons/folder.svg?component';
import KubeIcon from 'src/assets/icons/entityIcons/kubernetes.svg?component';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg?component';
import NodeBalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg?component';
import ObjectIcon from 'src/assets/icons/entityIcons/object.svg?component';
import StackScriptIcon from 'src/assets/icons/entityIcons/stackscript.svg?component';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg?component';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme,
} from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  root: {
    position: 'relative',
    color: 'transparent',
    display: 'flex',
  },
  default: {
    color: theme.color.grey1,
  },
}));

export type Variant =
  | 'linode'
  | 'nodebalancer'
  | 'volume'
  | 'domain'
  | 'stackscript'
  | 'kube'
  | 'bucket'
  | 'firewall'
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

type CombinedProps = Props & WithTheme;

const iconMap = {
  linode: LinodeIcon,
  nodebalancer: NodeBalancerIcon,
  volume: VolumeIcon,
  domain: DomainIcon,
  stackscript: StackScriptIcon,
  kube: KubeIcon,
  bucket: BucketIcon,
  firewall: FirewallIcon,
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

  const getStatusForDomain = (dStatus: string) => {
    switch (dStatus) {
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

  const getStatusForFirewall = (fStatus: string) =>
    fStatus === 'enabled' ? 'running' : 'offline';

  const finalStatus =
    variant === 'domain'
      ? status && getStatusForDomain(status)
      : variant === 'firewall'
      ? status && getStatusForFirewall(status)
      : status;

  return (
    <div
      className={classNames(
        {
          [classes.root]: true,
          [classes.default]: true,
          [classes[`${finalStatus}`]]: true,
        },
        className
      )}
      style={{ top: marginTop }}
      data-qa-icon={variant}
      data-qa-entity-status={status || 'undefined'}
      data-qa-is-loading={loading || 'false'}
      aria-label={`${variant} is ${finalStatus}`}
      {...rest}
    >
      <Icon width={iconSize} height={iconSize} />
    </div>
  );
};

const enhanced = compose<CombinedProps, Props>(withTheme);

export default enhanced(EntityIcon);
