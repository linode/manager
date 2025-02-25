import { styled } from '@mui/material/styles';
import * as React from 'react';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import DatabaseIcon from 'src/assets/icons/entityIcons/database.svg';
import MonitorIcon from 'src/assets/icons/entityIcons/monitor.svg';
import NetworkIcon from 'src/assets/icons/entityIcons/networking.svg';
import StorageIcon from 'src/assets/icons/entityIcons/storage.svg';
import Moreicon from 'src/assets/icons/more.svg';

export type EntityVariants =
  | 'compute'
  | 'database'
  | 'monitor'
  | 'more'
  | 'network'
  | 'storage';

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
  compute: ComputeIcon,
  database: DatabaseIcon,
  monitor: MonitorIcon,
  more: Moreicon,
  network: NetworkIcon,
  storage: StorageIcon,
};

const getIcon = (variant: EntityVariants) => {
  return iconMap[variant] ?? ComputeIcon;
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

  return (
    <EntityIconRoot
      aria-label={`${variant} is ${status}`}
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
