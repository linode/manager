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
  root: {
    position: 'relative',
    color: 'transparent'
  },
  default: {
    color: theme.palette.divider
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
    left: 0,
    transform: 'rotateY(360deg)'
  },
  loadingIcon: {
    animation: 'rotate 2s linear infinite',
    fill: theme.color.offBlack
  }
});

interface Props {
  variant: 'linode' | 'nodeBalancer' | 'volume' | 'domain' | 'stackscript';
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

  let icon;
  switch (variant) {
    case 'linode':
      icon = (
        <LinodeIcon
          className={classes.icon}
          width={iconSize}
          height={iconSize}
        />
      );
      break;
    case 'nodeBalancer':
      icon = (
        <NodeBalancerIcon
          className={classes.icon}
          width={iconSize}
          height={iconSize}
        />
      );
      break;
    case 'volume':
      icon = (
        <VolumeIcon
          className={classes.icon}
          width={iconSize}
          height={iconSize}
        />
      );
      break;
    case 'domain':
      icon = (
        <DomainIcon
          className={classes.icon}
          width={iconSize}
          height={iconSize}
        />
      );
      break;
    case 'stackscript':
      icon = (
        <StackScriptIcon
          className={classes.icon}
          width={iconSize}
          height={iconSize}
        />
      );
      break;
    default:
      icon = (
        <LinodeIcon
          className={classes.icon}
          width={iconSize}
          height={iconSize}
        />
      );
  }

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
    >
      {icon}
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
