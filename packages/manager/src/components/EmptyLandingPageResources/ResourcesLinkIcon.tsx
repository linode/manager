import { styled } from '@mui/material/styles';
import * as React from 'react';

import { isPropValid } from 'src/utilities/isPropValid';

interface ResourcesLinkIconProps {
  /**
   * The icon to display as a rendered SVG (JSX)
   */
  icon: JSX.Element;
  iconType: 'external' | 'pointer';
}

const StyledResourcesLinkIcon = styled('span', {
  label: 'StyledResourcesLinkIcon',
  shouldForwardProp: (prop) => isPropValid(['icon', 'iconType'], prop),
})<ResourcesLinkIconProps>(({ theme, ...props }) => ({
  '& svg': {
    height: props.iconType === 'external' ? 12 : 16,
    width: props.iconType === 'external' ? 12 : 16,
  },
  color: theme.textColors.linkActiveLight,
  display: 'inline-block',
  // nifty trick to avoid the icon from wrapping by itself after the last word
  marginLeft: -10,
  position: 'relative',
  top: props.iconType === 'pointer' ? 3 : 0,
  transform: 'translateX(18px)',
}));

export const ResourcesLinkIcon = (props: ResourcesLinkIconProps) => {
  const { icon } = props;

  return <StyledResourcesLinkIcon {...props}>{icon}</StyledResourcesLinkIcon>;
};
