import * as React from 'react';
import { styled } from '@mui/material/styles';
interface ResourcesLinksSectionProps {
  children: JSX.Element[] | JSX.Element;
}

const StyledResourcesLinksSection = styled('div', {
  label: 'StyledResourcesLinksSection',
})<ResourcesLinksSectionProps>(({ theme }) => ({
  maxWidth: 762,
  display: 'grid',
  gridAutoColumns: '1fr',
  gridAutoFlow: 'column',
  columnGap: theme.spacing(5),
  justifyItems: 'center',
  [theme.breakpoints.down('md')]: {
    gridAutoFlow: 'row',
    rowGap: theme.spacing(8),
    justifyItems: 'start',
  },
}));

export const ResourcesLinksSection = (props: ResourcesLinksSectionProps) => {
  return (
    <StyledResourcesLinksSection>{props.children}</StyledResourcesLinksSection>
  );
};
