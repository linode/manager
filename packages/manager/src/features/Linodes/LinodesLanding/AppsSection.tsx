import { styled } from '@mui/material/styles';
import * as React from 'react';

import PointerIcon from 'src/assets/icons/pointer.svg';
import { Link } from 'src/components/Link';
import { getLinkOnClick } from 'src/utilities/emptyStateLandingUtils';

const gaCategory = 'Linodes landing page empty';
const linkGAEventTemplate = {
  action: 'Click:link',
  category: gaCategory,
};

const appsLinkData = [
  {
    text: 'Wordpress',
    to:
      '/linodes/create?type=One-Click&appID=401697&utm_source=marketplace&utm_medium=website&utm_campaign=WordPress',
  },
  {
    text: 'Harbor',
    to:
      '/linodes/create?type=One-Click&appID=912262&utm_source=marketplace&utm_medium=website&utm_campaign=Harbor',
  },
  {
    text: 'cPanel',
    to:
      '/linodes/create?type=One-Click&appID=595742&utm_source=marketplace&utm_medium=website&utm_campaign=cPanel',
  },
  {
    text: 'Postgres Cluster',
    to:
      '/linodes/create?type=One-Click&appID=1068726&utm_source=marketplace&utm_medium=website&utm_campaign=Postgres_Cluster',
  },
  {
    text: 'Prometheus & Grafana',
    to:
      '/linodes/create?type=One-Click&appID=985364&utm_source=marketplace&utm_medium=website&utm_campaign=Prometheus_Grafana',
  },
  {
    text: 'Kali',
    to:
      '/linodes/create?type=One-Click&appID=1017300&utm_source=marketplace&utm_medium=website&utm_campaign=Kali',
  },
];

interface AppLinkProps {
  text: string;
  to: string;
}

const AppLink = (props: AppLinkProps) => {
  const { text, to } = props;
  return (
    <StyledLink onClick={getLinkOnClick(linkGAEventTemplate, text)} to={to}>
      {text}
      <StyledAppLinkDiv>
        <PointerIcon />
      </StyledAppLinkDiv>
    </StyledLink>
  );
};

const appLinks = appsLinkData.map((linkData) => (
  <AppLink {...linkData} key={linkData.to} />
));

export const AppsSection = () => {
  return <StyledAppSectionDiv>{appLinks}</StyledAppSectionDiv>;
};

const StyledAppLinkDiv = styled('div', { label: 'StyledAppLinkDiv' })(
  ({ theme }) => ({
    alignItems: 'center',
    aspectRatio: '1 / 1',
    borderLeft: `1px solid ${
      theme.name === 'dark' ? '#3a3f46' : theme.color.border3
    }`,
    color:
      theme.name === 'dark'
        ? theme.textColors.linkActiveLight
        : theme.palette.primary.main,
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
  })
);

const StyledLink = styled(Link, { label: 'StyledLink' })(({ theme }) => ({
  '&:focus': {
    textDecoration: 'none',
  },
  '&:hover': {
    textDecoration: 'none',
  },
  alignItems: 'center',
  backgroundColor:
    theme.name === 'dark' ? theme.bg.primaryNavPaper : theme.bg.offWhite,
  border: `1px solid ${
    theme.name === 'dark' ? '#3a3f46' : theme.color.border3
  }`,
  color: theme.palette.text.primary,
  display: 'flex',
  font: theme.font.bold,
  fontSize: '0.875rem',
  gridColumn: 'span 1',
  height: theme.spacing(4.75),
  justifyContent: 'space-between',
  maxWidth: theme.spacing(20),
  paddingLeft: theme.spacing(),
}));

const StyledAppSectionDiv = styled('div', { label: 'StyledAppSectionDiv' })(
  ({ theme }) => ({
    columnGap: theme.spacing(3),
    display: 'grid',
    gridAutoFlow: 'row',
    gridTemplateColumns: `repeat(2, ${theme.spacing(20)})`,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    rowGap: theme.spacing(),
  })
);
