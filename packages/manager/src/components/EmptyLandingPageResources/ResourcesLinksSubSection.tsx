import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { styled } from '@mui/material/styles';

interface ResourcesLinksSubSectionProps {
  children?: JSX.Element[] | JSX.Element;
  external?: boolean;
  icon: JSX.Element;
  MoreLink: (props: { className?: any }) => JSX.Element;
  title: string;
}

const StyledResourcesLinksSubSection = styled('div', {
  label: 'StyledResourcesLinksSubSection',
})(({ theme }) => ({
  display: 'grid',
  gridTemplateRows: `22px minmax(${theme.spacing(3)}, 100%) 1.125rem`,
  rowGap: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.between('md', 'lg')]: {
    gridTemplateRows: `50px minmax(${theme.spacing(3)}, 100%) 1.125rem`,
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
  '& > a': {
    color: theme.textColors.linkActiveLight,
    display: 'inline-block',
    fontSize: '0.875rem',
    fontWeight: 700,
  },
  '& li': {
    paddingLeft: 0,
    paddingRight: 0,
    '& > a': {
      fontSize: '0.875rem',
      color: theme.textColors.linkActiveLight,
    },
  },
}));

export const ResourcesLinksSubSection = (
  props: ResourcesLinksSubSectionProps
) => {
  const { children, icon, MoreLink, title } = props;

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
