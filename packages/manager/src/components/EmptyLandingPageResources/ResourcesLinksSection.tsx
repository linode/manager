import { styled } from '@mui/material/styles';
import * as React from 'react';
interface ResourcesLinksSectionProps {
  children: JSX.Element | JSX.Element[];
  /**
   * If true, the section will be 100% width (more than 2 columns)
   *
   * @example true on linodes empty state landing
   * @default true
   * */
  wide?: boolean;
}

const StyledResourcesLinksSection = styled('div', {
  label: 'StyledResourcesLinksSection',
})<ResourcesLinksSectionProps>(({ theme, ...props }) => ({
  columnGap: theme.spacing(5),
  display: 'grid',
  gridAutoColumns: '1fr',
  gridAutoFlow: 'column',
  justifyItems: 'center',
  maxWidth: props.wide === false ? 762 : '100%',
  [theme.breakpoints.down(props.wide ? 'lg' : 'md')]: {
    gridAutoFlow: 'row',
    justifyItems: 'start',
    rowGap: theme.spacing(8),
  },
}));

export const ResourcesLinksSection = ({
  children,
  wide = true,
}: ResourcesLinksSectionProps) => {
  return (
    <StyledResourcesLinksSection wide={wide}>
      {children}
    </StyledResourcesLinksSection>
  );
};
