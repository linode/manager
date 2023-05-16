import * as React from 'react';
import Link from 'src/components/Link';
import { styled } from '@mui/material/styles';
import { LinkProps } from 'react-router-dom';

type ResourcesMoreLinkProps = LinkProps & {
  external?: boolean;
};

const StyledMoreLink = styled(Link)<ResourcesMoreLinkProps>(({ ...props }) => ({
  alignItems: props.external ? 'baseline' : 'center',
}));

export const ResourcesMoreLink = (props: ResourcesMoreLinkProps) => {
  return <StyledMoreLink {...props} />;
};
