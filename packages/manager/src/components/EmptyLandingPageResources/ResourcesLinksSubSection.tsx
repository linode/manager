import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

interface ResourcesLinksSubSectionProps {
  MoreLink?: (props: { className?: any }) => JSX.Element;
  children?: JSX.Element | JSX.Element[];
  external?: boolean;
  icon?: JSX.Element;
  title?: string;
}

const StyledResourcesLinksSubSection = styled('div', {
  label: 'StyledResourcesLinksSubSection',
})(({ theme }) => ({
  '& > a': {
    display: 'inline-block',
    font: theme.font.bold,
    width: '100%',
  },
  '& > h2': {
    color: theme.palette.text.primary,
  },
  '& > h2 > svg': {
    height: '1.125rem',
    marginRight: theme.spacing(),
    width: '1.125rem',
  },
  '& li': {
    paddingLeft: 0,
    paddingRight: 0,
  },
  display: 'grid',
  fontSize: '0.875rem',
  gridTemplateRows: `22px minmax(${theme.spacing(3)}, 100%) 1.125rem`,
  rowGap: theme.spacing(2),
}));

export const ResourcesLinksSubSection = (
  props: ResourcesLinksSubSectionProps
) => {
  const { MoreLink, children, icon, title } = props;
  if (!title) {
    return null;
  }
  return (
    <StyledResourcesLinksSubSection>
      <Typography variant="h2">
        {icon} {title}
      </Typography>
      {children}
      {MoreLink && <MoreLink />}
    </StyledResourcesLinksSubSection>
  );
};
