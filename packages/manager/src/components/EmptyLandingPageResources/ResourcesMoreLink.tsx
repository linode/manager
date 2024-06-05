import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';

import type { LinkProps } from 'src/components/Link';

interface ResourcesMoreLinkProps extends LinkProps {
  external?: boolean;
}

const StyledMoreLink = styled(Link)<ResourcesMoreLinkProps>(({ ...props }) => ({
  '& svg': {
    // nifty trick to avoid the icon from wrapping by itself after the last word
    marginLeft: -18,
    transform: 'translateX(18px)',
  },
  alignItems: props.external ? 'baseline' : 'center',
}));

export const ResourcesMoreLink = (props: ResourcesMoreLinkProps) => {
  return <StyledMoreLink {...props}>{props.children}</StyledMoreLink>;
};
