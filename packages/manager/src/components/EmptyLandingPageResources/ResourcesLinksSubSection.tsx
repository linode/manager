import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Typography } from 'src/components/Typography';

interface ResourcesLinksSubSectionProps {
  MoreLink: (props: { className?: any }) => JSX.Element;
  children?: JSX.Element | JSX.Element[];
  external?: boolean;
  icon: JSX.Element;
  title: string;
}

const StyledResourcesLinksSubSection = styled('div', {
  label: 'StyledResourcesLinksSubSection',
})(({ theme }) => ({
  '& > a': {
    color: theme.textColors.linkActiveLight,
    display: 'inline-block',
    fontSize: '0.875rem',
    fontWeight: 700,
  },
  '& > h2': {
    color: theme.palette.text.primary,
  },
  '& > h2 > svg': {
    color: theme.palette.primary.main,
    height: '1.125rem',
    marginRight: theme.spacing(),
    width: '1.125rem',
  },
  '& li': {
    '& > a': {
      color: theme.textColors.linkActiveLight,
      fontSize: '0.875rem',
    },
    paddingLeft: 0,
    paddingRight: 0,
  },
  display: 'grid',
  gridTemplateRows: `22px minmax(${theme.spacing(3)}, 100%) 1.125rem`,
  rowGap: theme.spacing(2),
  width: '100%',
}));

export const ResourcesLinksSubSection = (
  props: ResourcesLinksSubSectionProps
) => {
  const { MoreLink, children, icon, title } = props;

  return (
    <StyledResourcesLinksSubSection>
      <Typography variant="h2">
        {icon} {title}
      </Typography>
      {children}
      <MoreLink />
    </StyledResourcesLinksSubSection>
  );
};
