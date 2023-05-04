import * as React from 'react';
import { styled } from '@mui/material/styles';

interface ResourcesLinkIconProps {
  /**
   * The icon to display as a rendered SVG (JSX))
   */
  icon: JSX.Element;
}

const StyledResourcesLinkIcon = styled('span', {
  label: 'StyledResourcesLinkIcon',
})<any>(({ theme }) => ({
  color: theme.textColors.linkActiveLight,
  display: 'inline-block',
  // nifty trick to avoid the icon from wrapping by itself after the last word
  marginLeft: -10,
  transform: 'translateX(18px)',
  '& svg': {
    height: 12,
    width: 12,
  },
}));

export const ResourcesLinkIcon = (props: ResourcesLinkIconProps) => {
  const { icon } = props;

  return <StyledResourcesLinkIcon>{icon}</StyledResourcesLinkIcon>;
};
