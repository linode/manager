import * as classNames from 'classnames';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import DomainIcon from 'src/assets/icons/entityIcons/domain.svg';
import LinodeIcon from 'src/assets/icons/entityIcons/linode.svg';
import LoadingIcon from 'src/assets/icons/entityIcons/loading.svg';
import NodeBalancerIcon from 'src/assets/icons/entityIcons/nodebalancer.svg';
import StackScriptIcon from 'src/assets/icons/entityIcons/stackscript.svg';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';

type ClassNames =
  | 'root'
  | 'default'
  | 'icon'
  | 'running'
  | 'offline'
  | 'loading'
  | 'loadingIcon';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  },
  root: {
    position: 'relative',
    color: 'transparent'
  },
  default: {
    color: theme.color.grey2
  },
  icon: {},
  running: {
    color: theme.color.green
  },
  offline: {
    color: theme.color.red
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  loadingIcon: {
    animation: 'rotate 2s linear infinite',
    fill: theme.color.offBlack
  }
});

interface Props {
  variant: 'linode' | 'nodebalancer' | 'volume' | 'domain' | 'stackscript';
  status?: string;
  loading?: boolean;
  size?: number;
  className?: any;
  marginTop?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const EntityIcon: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    variant,
    status,
    loading,
    size,
    className,
    marginTop
  } = props;

  const iconSize = size ? size : 40;
  const iconMap = {
    linode: LinodeIcon,
    nodebalancer: NodeBalancerIcon,
    volume: VolumeIcon,
    domain: DomainIcon,
    stackscript: StackScriptIcon
  };

  const Icon = iconMap[variant];

  return (
    <div
      className={classNames(
        {
          [classes.root]: true,
          [classes.default]: !loading,
          [classes[`${status}`]]: !loading
        },
        className
      )}
      style={{ top: marginTop && marginTop }}
      data-qa-icon={variant}
      data-qa-entity-status={status || 'undefined'}
      data-qa-is-loading={loading || 'false'}
    >
      <Icon className={classes.icon} width={iconSize} height={iconSize} />
      {loading && (
        <div className={classes.loading}>
          <LoadingIcon
            className={classes.loadingIcon}
            width={iconSize - 2}
            height={iconSize - 2}
          />
        </div>
      )}
    </div>
  );
};

const styled = withStyles(styles);

export default styled(EntityIcon);

export const getStatusForDomain = (status: string) => {
  switch (status) {
    case 'edit_mode':
      return 'edit';
    case 'active':
      return 'running';
    case 'disabled':
      return 'offline';
    case 'has_errors':
      return 'offline';
    default:
      return 'offline';
  }
};
